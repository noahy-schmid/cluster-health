import { Effect, Layer, Option } from "effect";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { websitesTable } from "../schema";
import { WebsiteDatabaseError } from "../types/website-errors";
import { WebsiteRepository } from "../ports/website.port";

/**
 * PostgreSQL implementation of the WebsiteRepository using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  yield* Effect.log("Initializing PostgresWebsiteAdapter");

  const createWebsite: WebsiteRepository["createWebsite"] = (input) =>
    Effect.gen(function* () {
      const [created] = yield* Effect.tryPromise(async () => {
        return await db.insert(websitesTable).values(input).returning();
      }).pipe(
        Effect.catchAll((error) => {
          return Effect.fail(
            new WebsiteDatabaseError({
              message: "Failed to create website",
              cause: error.cause,
            }),
          );
        }),
      );

      if (!created) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: "Failed to create website - no result returned",
          }),
        );
      }

      return created;
    });

  const getWebsiteById: WebsiteRepository["getWebsiteById"] = (id) =>
    Effect.gen(function* () {
      const [website] = yield* Effect.tryPromise(async () => {
        return await db
          .select()
          .from(websitesTable)
          .where(eq(websitesTable.id, id))
          .limit(1);
      }).pipe(
        Effect.catchAll((error) => {
          return Effect.fail(
            new WebsiteDatabaseError({
              message: `Failed to fetch website by id: ${id}`,
              cause: error.cause,
            }),
          );
        }),
      );

      return Option.fromNullable(website);
    });

  const getWebsiteBySalonId: WebsiteRepository["getWebsiteBySalonId"] = (
    salonId,
  ) =>
    Effect.gen(function* () {
      const [website] = yield* Effect.tryPromise(async () => {
        return await db
          .select()
          .from(websitesTable)
          .where(eq(websitesTable.salonId, salonId))
          .limit(1);
      }).pipe(
        Effect.catchAll((error) => {
          return Effect.fail(
            new WebsiteDatabaseError({
              message: `Failed to fetch website by salon id: ${salonId}`,
              cause: error.cause,
            }),
          );
        }),
      );

      return Option.fromNullable(website);
    });

  const hasWebsiteForSalonId: WebsiteRepository["hasWebsiteForSalonId"] = (
    salonId,
  ) =>
    Effect.gen(function* () {
      const [result] = yield* Effect.tryPromise(async () => {
        return await db
          .select({ id: websitesTable.id })
          .from(websitesTable)
          .where(eq(websitesTable.salonId, salonId))
          .limit(1);
      }).pipe(
        Effect.catchAll((error) => {
          return Effect.fail(
            new WebsiteDatabaseError({
              message: `Failed to check if salon has website: ${salonId}`,
              cause: error.cause,
            }),
          );
        }),
      );

      return !!result;
    });

  const updateWebsite: WebsiteRepository["updateWebsite"] = (id, updates) =>
    Effect.gen(function* () {
      const [updated] = yield* Effect.tryPromise(async () => {
        return await db
          .update(websitesTable)
          .set(updates)
          .where(eq(websitesTable.id, id))
          .returning();
      }).pipe(
        Effect.catchAll((error) => {
          return Effect.fail(
            new WebsiteDatabaseError({
              message: `Failed to update website: ${id}`,
              cause: error.cause,
            }),
          );
        }),
      );

      return Option.fromNullable(updated);
    });

  return {
    createWebsite,
    getWebsiteById,
    getWebsiteBySalonId,
    hasWebsiteForSalonId,
    updateWebsite,
  } satisfies WebsiteRepository;
});

/**
 * Layer that provides the PostgreSQL WebsiteRepository implementation.
 */
export const PostgresWebsiteAdapter = Layer.effect(WebsiteRepository, make);
