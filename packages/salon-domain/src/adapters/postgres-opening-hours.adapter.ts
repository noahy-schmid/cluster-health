import { Effect, Layer } from "effect";
import { and, asc, eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import {
  salonOpeningHoursTable,
  salonOpeningHoursExceptionsTable,
} from "../schema";
import { OpeningHoursPort } from "../ports/opening-hours.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the OpeningHoursPort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const upsertOpeningHours: OpeningHoursPort["upsertOpeningHours"] = (input) =>
    Effect.gen(function* () {
      // Delete existing entry for this day first, then insert (upsert semantics)
      yield* Effect.tryPromise(() =>
        db
          .delete(salonOpeningHoursTable)
          .where(
            and(
              eq(salonOpeningHoursTable.salonId, input.salonId),
              eq(salonOpeningHoursTable.dayOfWeek, input.dayOfWeek),
            ),
          ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to clear existing opening hours",
              cause: error,
            }),
        ),
      );

      const [created] = yield* Effect.tryPromise(() =>
        db.insert(salonOpeningHoursTable).values(input).returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to create opening hours",
              cause: error,
            }),
        ),
      );

      if (!created) {
        return yield* Effect.fail(
          new InfrastructureError({
            message: "Failed to create opening hours: no row returned",
          }),
        );
      }

      return created;
    });

  const deleteOpeningHours: OpeningHoursPort["deleteOpeningHours"] = (
    salonId,
    dayOfWeek,
  ) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .delete(salonOpeningHoursTable)
          .where(
            and(
              eq(salonOpeningHoursTable.salonId, salonId),
              eq(salonOpeningHoursTable.dayOfWeek, dayOfWeek),
            ),
          )
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to delete opening hours",
              cause: error,
            }),
        ),
      );

      return rows.length > 0;
    });

  const listOpeningHours: OpeningHoursPort["listOpeningHours"] = (salonId) =>
    Effect.tryPromise(() =>
      db
        .select()
        .from(salonOpeningHoursTable)
        .where(eq(salonOpeningHoursTable.salonId, salonId))
        .orderBy(asc(salonOpeningHoursTable.dayOfWeek)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new InfrastructureError({
            message: "Failed to list opening hours",
            cause: error,
          }),
      ),
    );

  const upsertOpeningHoursException: OpeningHoursPort["upsertOpeningHoursException"] =
    (input) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          db
            .delete(salonOpeningHoursExceptionsTable)
            .where(
              and(
                eq(salonOpeningHoursExceptionsTable.salonId, input.salonId),
                eq(salonOpeningHoursExceptionsTable.date, input.date),
              ),
            ),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to clear existing opening hours exception",
                cause: error,
              }),
          ),
        );

        const [created] = yield* Effect.tryPromise(() =>
          db
            .insert(salonOpeningHoursExceptionsTable)
            .values({
              salonId: input.salonId,
              date: input.date,
              isClosed: input.isClosed,
              openTime: input.openTime ?? null,
              closeTime: input.closeTime ?? null,
              reason: input.reason ?? null,
            })
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to create opening hours exception",
                cause: error,
              }),
          ),
        );

        if (!created) {
          return yield* Effect.fail(
            new InfrastructureError({
              message:
                "Failed to create opening hours exception: no row returned",
            }),
          );
        }

        return created;
      });

  const deleteOpeningHoursException: OpeningHoursPort["deleteOpeningHoursException"] =
    (id) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .delete(salonOpeningHoursExceptionsTable)
            .where(eq(salonOpeningHoursExceptionsTable.id, id))
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to delete opening hours exception",
                cause: error,
              }),
          ),
        );

        return rows.length > 0;
      });

  const listOpeningHoursExceptions: OpeningHoursPort["listOpeningHoursExceptions"] =
    (salonId) =>
      Effect.tryPromise(() =>
        db
          .select()
          .from(salonOpeningHoursExceptionsTable)
          .where(eq(salonOpeningHoursExceptionsTable.salonId, salonId))
          .orderBy(asc(salonOpeningHoursExceptionsTable.date)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to list opening hours exceptions",
              cause: error,
            }),
        ),
      );

  return {
    upsertOpeningHours,
    deleteOpeningHours,
    listOpeningHours,
    upsertOpeningHoursException,
    deleteOpeningHoursException,
    listOpeningHoursExceptions,
  } satisfies OpeningHoursPort;
});

/**
 * Layer that provides the PostgreSQL OpeningHoursPort implementation.
 */
export const PostgresOpeningHoursAdapter = Layer.effect(
  OpeningHoursPort,
  make,
);
