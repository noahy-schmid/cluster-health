import { Effect, Layer } from "effect";
import {
  OpeningHoursPort,
  type PortOpeningHours,
  type PortOpeningHoursException,
} from "../../ports/opening-hours.port";
import {
  OpeningHoursInternalError,
  OpeningHoursValidationError,
  OpeningHoursNotFoundError,
} from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresOpeningHoursAdapter } from "../../adapters/postgres-opening-hours.adapter";

// --- Domain types ---

export type OpeningHours = PortOpeningHours;
export type OpeningHoursException = PortOpeningHoursException;

// --- Validation helpers ---

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

function validateTime(time: string, _field: string): boolean {
  return TIME_REGEX.test(time);
}

function validateDayOfWeek(day: number): boolean {
  return Number.isInteger(day) && day >= 0 && day <= 6;
}

function validateTimeRange(openTime: string, closeTime: string): boolean {
  return openTime < closeTime;
}

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const openingHoursPort = yield* OpeningHoursPort;

  const setOpeningHours = (
    salonId: string,
    dayOfWeek: number,
    openTime: string,
    closeTime: string,
  ) =>
    Effect.gen(function* () {
      if (!validateDayOfWeek(dayOfWeek)) {
        return yield* Effect.fail(
          new OpeningHoursValidationError({
            message:
              "dayOfWeek must be an integer between 0 (Monday) and 6 (Sunday)",
          }),
        );
      }

      if (!validateTime(openTime, "openTime")) {
        return yield* Effect.fail(
          new OpeningHoursValidationError({
            message: "openTime must be in HH:mm format (e.g. 09:00)",
          }),
        );
      }

      if (!validateTime(closeTime, "closeTime")) {
        return yield* Effect.fail(
          new OpeningHoursValidationError({
            message: "closeTime must be in HH:mm format (e.g. 18:00)",
          }),
        );
      }

      if (!validateTimeRange(openTime, closeTime)) {
        return yield* Effect.fail(
          new OpeningHoursValidationError({
            message: "openTime must be before closeTime",
          }),
        );
      }

      return yield* openingHoursPort
        .upsertOpeningHours({ salonId, dayOfWeek, openTime, closeTime })
        .pipe(
          Effect.mapError(
            (error) =>
              new OpeningHoursInternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );
    });

  const deleteOpeningHours = (salonId: string, dayOfWeek: number) =>
    Effect.gen(function* () {
      if (!validateDayOfWeek(dayOfWeek)) {
        return yield* Effect.fail(
          new OpeningHoursValidationError({
            message: "dayOfWeek must be an integer between 0 and 6",
          }),
        );
      }

      yield* openingHoursPort.deleteOpeningHours(salonId, dayOfWeek).pipe(
        Effect.mapError(
          (error) =>
            new OpeningHoursInternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );
    });

  const listOpeningHours = (salonId: string) =>
    openingHoursPort.listOpeningHours(salonId).pipe(
      Effect.mapError(
        (error) =>
          new OpeningHoursInternalError({
            message: error.message,
            cause: error,
          }),
      ),
    );

  const createException = (
    salonId: string,
    date: string,
    isClosed: boolean,
    openTime?: string | null,
    closeTime?: string | null,
    reason?: string | null,
  ) =>
    Effect.gen(function* () {
      // Validate date format YYYY-MM-DD
      if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
        return yield* Effect.fail(
          new OpeningHoursValidationError({
            message: "date must be in YYYY-MM-DD format",
          }),
        );
      }

      if (!isClosed) {
        if (!openTime || !closeTime) {
          return yield* Effect.fail(
            new OpeningHoursValidationError({
              message:
                "openTime and closeTime are required when isClosed is false",
            }),
          );
        }

        if (!validateTime(openTime, "openTime")) {
          return yield* Effect.fail(
            new OpeningHoursValidationError({
              message: "openTime must be in HH:mm format",
            }),
          );
        }

        if (!validateTime(closeTime, "closeTime")) {
          return yield* Effect.fail(
            new OpeningHoursValidationError({
              message: "closeTime must be in HH:mm format",
            }),
          );
        }

        if (!validateTimeRange(openTime, closeTime)) {
          return yield* Effect.fail(
            new OpeningHoursValidationError({
              message: "openTime must be before closeTime",
            }),
          );
        }
      }

      return yield* openingHoursPort
        .upsertOpeningHoursException({
          salonId,
          date,
          isClosed,
          openTime: isClosed ? null : openTime,
          closeTime: isClosed ? null : closeTime,
          reason: reason ?? null,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new OpeningHoursInternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );
    });

  const deleteException = (id: string) =>
    Effect.gen(function* () {
      const deleted = yield* openingHoursPort
        .deleteOpeningHoursException(id)
        .pipe(
          Effect.mapError(
            (error) =>
              new OpeningHoursInternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );

      if (!deleted) {
        return yield* Effect.fail(new OpeningHoursNotFoundError({ id }));
      }
    });

  const listExceptions = (salonId: string) =>
    openingHoursPort.listOpeningHoursExceptions(salonId).pipe(
      Effect.mapError(
        (error) =>
          new OpeningHoursInternalError({
            message: error.message,
            cause: error,
          }),
      ),
    );

  return {
    setOpeningHours,
    deleteOpeningHours,
    listOpeningHours,
    createException,
    deleteException,
    listExceptions,
  };
});

export class OpeningHoursAggregate extends Effect.Service<OpeningHoursAggregate>()(
  "@repo/salon-domain/OpeningHoursAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresOpeningHoursAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
