import { Effect, Layer } from "effect";
import {
  StylistAvailabilityPort,
  type PortStylistAvailability,
  type PortStylistAvailabilityException,
} from "../../ports/stylist-availability.port";
import {
  StylistAvailabilityInternalError,
  StylistAvailabilityNotFoundError,
  StylistAvailabilityValidationError,
} from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresStylistAvailabilityAdapter } from "../../adapters/postgres-stylist-availability.adapter";

// --- Domain types ---

export type StylistAvailability = PortStylistAvailability;
export type StylistAvailabilityException = PortStylistAvailabilityException;

// --- Validation helpers ---

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateTime(time: string): boolean {
  return TIME_REGEX.test(time);
}

function validateDayOfWeek(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

function validateTimeRange(startTime: string, endTime: string): boolean {
  return startTime < endTime;
}

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const availabilityPort = yield* StylistAvailabilityPort;

  const setAvailability = (
    stylistId: string,
    salonId: string,
    dayOfWeek: number,
    startTime: string,
    endTime: string,
  ) =>
    Effect.gen(function* () {
      if (!validateDayOfWeek(dayOfWeek)) {
        return yield* Effect.fail(
          new StylistAvailabilityValidationError({
            message:
              "dayOfWeek must be an integer between 0 (Monday) and 6 (Sunday)",
          }),
        );
      }

      if (!validateTime(startTime)) {
        return yield* Effect.fail(
          new StylistAvailabilityValidationError({
            message: "startTime must be in HH:mm format (e.g. 09:00)",
          }),
        );
      }

      if (!validateTime(endTime)) {
        return yield* Effect.fail(
          new StylistAvailabilityValidationError({
            message: "endTime must be in HH:mm format (e.g. 18:00)",
          }),
        );
      }

      if (!validateTimeRange(startTime, endTime)) {
        return yield* Effect.fail(
          new StylistAvailabilityValidationError({
            message: "startTime must be before endTime",
          }),
        );
      }

      return yield* availabilityPort
        .upsertAvailability({ stylistId, salonId, dayOfWeek, startTime, endTime })
        .pipe(
          Effect.mapError(
            (error) =>
              new StylistAvailabilityInternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );
    });

  const deleteAvailability = (stylistId: string, dayOfWeek: number) =>
    Effect.gen(function* () {
      if (!validateDayOfWeek(dayOfWeek)) {
        return yield* Effect.fail(
          new StylistAvailabilityValidationError({
            message: "dayOfWeek must be an integer between 0 and 6",
          }),
        );
      }

      yield* availabilityPort.deleteAvailability(stylistId, dayOfWeek).pipe(
        Effect.mapError(
          (error) =>
            new StylistAvailabilityInternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );
    });

  const listAvailability = (stylistId: string) =>
    availabilityPort.listAvailability(stylistId).pipe(
      Effect.mapError(
        (error) =>
          new StylistAvailabilityInternalError({
            message: error.message,
            cause: error,
          }),
      ),
    );

  const createException = (
    stylistId: string,
    salonId: string,
    date: string,
    isAbsent: boolean,
    startTime?: string | null,
    endTime?: string | null,
    reason?: string | null,
  ) =>
    Effect.gen(function* () {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return yield* Effect.fail(
          new StylistAvailabilityValidationError({
            message: "date must be in YYYY-MM-DD format",
          }),
        );
      }

      if (!isAbsent) {
        if (!startTime || !endTime) {
          return yield* Effect.fail(
            new StylistAvailabilityValidationError({
              message:
                "startTime and endTime are required when isAbsent is false",
            }),
          );
        }

        if (!validateTime(startTime)) {
          return yield* Effect.fail(
            new StylistAvailabilityValidationError({
              message: "startTime must be in HH:mm format",
            }),
          );
        }

        if (!validateTime(endTime)) {
          return yield* Effect.fail(
            new StylistAvailabilityValidationError({
              message: "endTime must be in HH:mm format",
            }),
          );
        }

        if (!validateTimeRange(startTime, endTime)) {
          return yield* Effect.fail(
            new StylistAvailabilityValidationError({
              message: "startTime must be before endTime",
            }),
          );
        }
      }

      return yield* availabilityPort
        .upsertAvailabilityException({
          stylistId,
          salonId,
          date,
          isAbsent,
          startTime: isAbsent ? null : startTime,
          endTime: isAbsent ? null : endTime,
          reason: reason ?? null,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new StylistAvailabilityInternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );
    });

  const deleteException = (id: string) =>
    Effect.gen(function* () {
      const deleted = yield* availabilityPort
        .deleteAvailabilityException(id)
        .pipe(
          Effect.mapError(
            (error) =>
              new StylistAvailabilityInternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );

      if (!deleted) {
        return yield* Effect.fail(
          new StylistAvailabilityNotFoundError({ id }),
        );
      }
    });

  const listExceptions = (stylistId: string) =>
    availabilityPort.listAvailabilityExceptions(stylistId).pipe(
      Effect.mapError(
        (error) =>
          new StylistAvailabilityInternalError({
            message: error.message,
            cause: error,
          }),
      ),
    );

  return {
    setAvailability,
    deleteAvailability,
    listAvailability,
    createException,
    deleteException,
    listExceptions,
  };
});

export class StylistAvailabilityAggregate extends Effect.Service<StylistAvailabilityAggregate>()(
  "@repo/salon-domain/StylistAvailabilityAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresStylistAvailabilityAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
