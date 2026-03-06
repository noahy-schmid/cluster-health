import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { salonsTable } from "../schema";
import { SalonPort } from "../ports/salon.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the SalonPort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const salonExists: SalonPort["salonExists"] = (salonId) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select({ id: salonsTable.id })
          .from(salonsTable)
          .where(eq(salonsTable.id, salonId))
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to check salon existence",
              cause: error,
            }),
        ),
      );

      return !!row;
    });

  return {
    salonExists,
  } satisfies SalonPort;
});

/**
 * Layer that provides the PostgreSQL SalonPort implementation.
 */
export const PostgresSalonPortAdapter = Layer.effect(SalonPort, make);
