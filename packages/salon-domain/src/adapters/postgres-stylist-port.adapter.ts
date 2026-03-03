import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { stylistsTable } from "../schema";
import { StylistPort, StylistPortError } from "../ports/stylist.port";

/**
 * PostgreSQL implementation of the StylistPort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const stylistExists: StylistPort["stylistExists"] = (stylistId) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select({ id: stylistsTable.id })
          .from(stylistsTable)
          .where(eq(stylistsTable.id, stylistId))
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new StylistPortError({
              message: "Failed to check stylist existence",
              cause: error,
            }),
        ),
      );

      return !!row;
    });

  return {
    stylistExists,
  } satisfies StylistPort;
});

/**
 * Layer that provides the PostgreSQL StylistPort implementation.
 */
export const PostgresStylistPortAdapter = Layer.effect(StylistPort, make);
