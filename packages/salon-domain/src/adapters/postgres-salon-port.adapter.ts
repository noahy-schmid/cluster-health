import { Effect, Layer } from "effect";
import { eq, sql } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { salonsTable } from "../schema";
import { SalonPort } from "../ports/salon.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the SalonPort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const createSalon: SalonPort["createSalon"] = (input) =>
    Effect.gen(function* () {
      const [created] = yield* Effect.tryPromise(() =>
        db.insert(salonsTable).values(input).returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to create salon",
              cause: error,
            }),
        ),
      );

      if (!created) {
        return yield* Effect.fail(
          new InfrastructureError({
            message: "Failed to create salon: no row returned",
          }),
        );
      }

      return created;
    });

  const findSalonById: SalonPort["findSalonById"] = (salonId) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(salonsTable)
          .where(eq(salonsTable.id, salonId))
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to fetch salon",
              cause: error,
            }),
        ),
      );

      return row ?? null;
    });

  const findSalonByName: SalonPort["findSalonByName"] = (name) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(salonsTable)
          .where(sql`lower(${salonsTable.name}) = lower(${name})`)
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to fetch salon by name",
              cause: error,
            }),
        ),
      );

      return row ?? null;
    });

  const updateSalon: SalonPort["updateSalon"] = (salonId, input) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .update(salonsTable)
          .set({
            ...input,
            updatedAt: new Date(),
          })
          .where(eq(salonsTable.id, salonId))
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to update salon",
              cause: error,
            }),
        ),
      );

      return rows[0] ?? null;
    });

  const salonExists: SalonPort["salonExists"] = (salonId) =>
    findSalonById(salonId).pipe(Effect.map((row) => !!row));

  return {
    createSalon,
    findSalonById,
    findSalonByName,
    updateSalon,
    salonExists,
  } satisfies SalonPort;
});

/**
 * Layer that provides the PostgreSQL SalonPort implementation.
 */
export const PostgresSalonPortAdapter = Layer.effect(SalonPort, make);
