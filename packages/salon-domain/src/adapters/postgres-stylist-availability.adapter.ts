import { Effect, Layer } from "effect";
import { and, asc, eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import {
  stylistAvailabilityTable,
  stylistAvailabilityExceptionsTable,
} from "../schema";
import { StylistAvailabilityPort } from "../ports/stylist-availability.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the StylistAvailabilityPort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const upsertAvailability: StylistAvailabilityPort["upsertAvailability"] = (
    input,
  ) =>
    Effect.gen(function* () {
      yield* Effect.tryPromise(() =>
        db
          .delete(stylistAvailabilityTable)
          .where(
            and(
              eq(stylistAvailabilityTable.stylistId, input.stylistId),
              eq(stylistAvailabilityTable.dayOfWeek, input.dayOfWeek),
            ),
          ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to clear existing stylist availability",
              cause: error,
            }),
        ),
      );

      const [created] = yield* Effect.tryPromise(() =>
        db.insert(stylistAvailabilityTable).values(input).returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to create stylist availability",
              cause: error,
            }),
        ),
      );

      if (!created) {
        return yield* Effect.fail(
          new InfrastructureError({
            message: "Failed to create stylist availability: no row returned",
          }),
        );
      }

      return created;
    });

  const deleteAvailability: StylistAvailabilityPort["deleteAvailability"] = (
    stylistId,
    dayOfWeek,
  ) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .delete(stylistAvailabilityTable)
          .where(
            and(
              eq(stylistAvailabilityTable.stylistId, stylistId),
              eq(stylistAvailabilityTable.dayOfWeek, dayOfWeek),
            ),
          )
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to delete stylist availability",
              cause: error,
            }),
        ),
      );

      return rows.length > 0;
    });

  const listAvailability: StylistAvailabilityPort["listAvailability"] = (
    stylistId,
  ) =>
    Effect.tryPromise(() =>
      db
        .select()
        .from(stylistAvailabilityTable)
        .where(eq(stylistAvailabilityTable.stylistId, stylistId))
        .orderBy(asc(stylistAvailabilityTable.dayOfWeek)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new InfrastructureError({
            message: "Failed to list stylist availability",
            cause: error,
          }),
      ),
    );

  const upsertAvailabilityException: StylistAvailabilityPort["upsertAvailabilityException"] =
    (input) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          db
            .delete(stylistAvailabilityExceptionsTable)
            .where(
              and(
                eq(
                  stylistAvailabilityExceptionsTable.stylistId,
                  input.stylistId,
                ),
                eq(stylistAvailabilityExceptionsTable.date, input.date),
              ),
            ),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message:
                  "Failed to clear existing stylist availability exception",
                cause: error,
              }),
          ),
        );

        const [created] = yield* Effect.tryPromise(() =>
          db
            .insert(stylistAvailabilityExceptionsTable)
            .values({
              stylistId: input.stylistId,
              salonId: input.salonId,
              date: input.date,
              isAbsent: input.isAbsent,
              startTime: input.startTime ?? null,
              endTime: input.endTime ?? null,
              reason: input.reason ?? null,
            })
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to create stylist availability exception",
                cause: error,
              }),
          ),
        );

        if (!created) {
          return yield* Effect.fail(
            new InfrastructureError({
              message:
                "Failed to create stylist availability exception: no row returned",
            }),
          );
        }

        return created;
      });

  const deleteAvailabilityException: StylistAvailabilityPort["deleteAvailabilityException"] =
    (id) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .delete(stylistAvailabilityExceptionsTable)
            .where(eq(stylistAvailabilityExceptionsTable.id, id))
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to delete stylist availability exception",
                cause: error,
              }),
          ),
        );

        return rows.length > 0;
      });

  const listAvailabilityExceptions: StylistAvailabilityPort["listAvailabilityExceptions"] =
    (stylistId) =>
      Effect.tryPromise(() =>
        db
          .select()
          .from(stylistAvailabilityExceptionsTable)
          .where(eq(stylistAvailabilityExceptionsTable.stylistId, stylistId))
          .orderBy(asc(stylistAvailabilityExceptionsTable.date)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to list stylist availability exceptions",
              cause: error,
            }),
        ),
      );

  return {
    upsertAvailability,
    deleteAvailability,
    listAvailability,
    upsertAvailabilityException,
    deleteAvailabilityException,
    listAvailabilityExceptions,
  } satisfies StylistAvailabilityPort;
});

/**
 * Layer that provides the PostgreSQL StylistAvailabilityPort implementation.
 */
export const PostgresStylistAvailabilityAdapter = Layer.effect(
  StylistAvailabilityPort,
  make,
);
