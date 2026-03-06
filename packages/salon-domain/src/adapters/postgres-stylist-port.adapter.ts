import { Effect, Layer } from "effect";
import { eq, inArray } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { stylistsTable } from "../schema";
import { StylistPort } from "../ports/stylist.port";
import { InfrastructureError } from "../application/errors";

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
            new InfrastructureError({
              message: "Failed to check stylist existence",
              cause: error,
            }),
        ),
      );

      return !!row;
    });

  const getStylistById: StylistPort["getStylistById"] = (stylistId) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select({
            id: stylistsTable.id,
            salonId: stylistsTable.salonId,
            name: stylistsTable.name,
          })
          .from(stylistsTable)
          .where(eq(stylistsTable.id, stylistId))
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to fetch stylist by ID",
              cause: error,
            }),
        ),
      );

      return row ?? null;
    });

  const getStylistsByIds: StylistPort["getStylistsByIds"] = (ids) =>
    Effect.gen(function* () {
      if (ids.length === 0) {
        return [];
      }

      const rows = yield* Effect.tryPromise(() =>
        db
          .select({
            id: stylistsTable.id,
            salonId: stylistsTable.salonId,
            name: stylistsTable.name,
          })
          .from(stylistsTable)
          .where(inArray(stylistsTable.id, ids)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to fetch stylists by IDs",
              cause: error,
            }),
        ),
      );

      return rows;
    });

  return {
    stylistExists,
    getStylistById,
    getStylistsByIds,
  } satisfies StylistPort;
});

/**
 * Layer that provides the PostgreSQL StylistPort implementation.
 */
export const PostgresStylistPortAdapter = Layer.effect(StylistPort, make);
