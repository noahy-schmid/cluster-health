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
      try {
        const [created] = yield* Effect.promise(async () => {
          return await db.insert(websitesTable).values(input).returning();
        });

        if (!created) {
          return yield* Effect.fail(
            new WebsiteDatabaseError({
              message: "Failed to create website - no result returned",
            }),
          );
        }

        return created;
      } catch (error) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: "Failed to create website",
            cause: error,
          }),
        );
      }
    });

  const getWebsiteById: WebsiteRepository["getWebsiteById"] = (id) =>
    Effect.gen(function* () {
      try {
        const [website] = yield* Effect.promise(async () => {
          return await db
            .select()
            .from(websitesTable)
            .where(eq(websitesTable.id, id))
            .limit(1);
        });

        return Option.fromNullable(website);
      } catch (error) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: `Failed to fetch website by id: ${id}`,
            cause: error,
          }),
        );
      }
    });

  const getWebsiteBySalonId: WebsiteRepository["getWebsiteBySalonId"] = (
    salonId,
  ) =>
    Effect.gen(function* () {
      try {
        const [website] = yield* Effect.promise(async () => {
          return await db
            .select()
            .from(websitesTable)
            .where(eq(websitesTable.salonId, salonId))
            .limit(1);
        });

        return Option.fromNullable(website);
      } catch (error) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: `Failed to fetch website by salon id: ${salonId}`,
            cause: error,
          }),
        );
      }
    });

  const hasWebsiteForSalonId: WebsiteRepository["hasWebsiteForSalonId"] = (
    salonId,
  ) =>
    Effect.gen(function* () {
      try {
        const [result] = yield* Effect.promise(async () => {
          return await db
            .select({ id: websitesTable.id })
            .from(websitesTable)
            .where(eq(websitesTable.salonId, salonId))
            .limit(1);
        });

        return !!result;
      } catch (error) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: `Failed to check if salon has website: ${salonId}`,
            cause: error,
          }),
        );
      }
    });

  const updateWebsite: WebsiteRepository["updateWebsite"] = (id, updates) =>
    Effect.gen(function* () {
      try {
        const [updated] = yield* Effect.promise(async () => {
          return await db
            .update(websitesTable)
            .set(updates)
            .where(eq(websitesTable.id, id))
            .returning();
        });

        return Option.fromNullable(updated);
      } catch (error) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: `Failed to update website: ${id}`,
            cause: error,
          }),
        );
      }
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
