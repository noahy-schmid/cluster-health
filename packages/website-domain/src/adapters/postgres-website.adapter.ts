import { Effect, Layer, Option } from "effect";
import { eq } from "drizzle-orm";
import { websitesTable } from "../schema";
import {
  WebsiteAlreadyExistsError,
  WebsiteDatabaseError,
} from "../types/website-errors";
import { WebsitePort } from "../ports/website.port";
import { Database } from "../infrastructure/database.interface";

/**
 * PostgreSQL implementation of the WebsiteRepository using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  yield* Effect.succeed(undefined);
  const { db } = yield* Database;

  const createWebsite: WebsitePort["createWebsite"] = (input) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db.insert(websitesTable).values(input).returning(),
      ).pipe(
        Effect.mapError((error) => {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const cause = (error.cause as any)?.cause;
          if (cause?.code === "23505") {
            if (cause?.constraint === "websites_salonId_unique") {
              return new WebsiteAlreadyExistsError({
                salonId: input.salonId,
              });
            }
            if (cause?.constraint === "websites_slug_unique") {
              return new WebsiteAlreadyExistsError({ slug: input.slug });
            }
          }
          return new WebsiteDatabaseError({
            message: "Failed to create website",
            cause: error,
          });
        }),
      );

      const created = rows[0];
      if (!created) {
        return yield* Effect.fail(
          new WebsiteDatabaseError({
            message: "Failed to create website - no result returned",
          }),
        );
      }

      return created;
    });

  const getWebsiteById: WebsitePort["getWebsiteById"] = (id) =>
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

  const getWebsiteBySalonId: WebsitePort["getWebsiteBySalonId"] = (salonId) =>
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

  const getWebsiteBySlug: WebsitePort["getWebsiteBySlug"] = (slug) =>
    Effect.gen(function* () {
      const [website] = yield* Effect.tryPromise(async () => {
        return await db
          .select()
          .from(websitesTable)
          .where(eq(websitesTable.slug, slug))
          .limit(1);
      }).pipe(
        Effect.catchAll((error) => {
          return Effect.fail(
            new WebsiteDatabaseError({
              message: `Failed to fetch website by slug: ${slug}`,
              cause: error.cause,
            }),
          );
        }),
      );

      return Option.fromNullable(website);
    });

  const hasWebsiteForSalonId: WebsitePort["hasWebsiteForSalonId"] = (salonId) =>
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

  const updateWebsite: WebsitePort["updateWebsite"] = (id, updates) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .update(websitesTable)
          .set(updates)
          .where(eq(websitesTable.id, id))
          .returning(),
      ).pipe(
        Effect.mapError(
          (error): WebsiteDatabaseError | WebsiteAlreadyExistsError => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const cause = (error.cause as any)?.cause;
            if (cause?.code === "23505") {
              if (cause?.constraint === "websites_slug_unique") {
                return new WebsiteAlreadyExistsError({ slug: updates.slug });
              }
            }
            return new WebsiteDatabaseError({
              message: `Failed to update website: ${id}`,
              cause: error,
            });
          },
        ),
      );

      return Option.fromNullable(rows[0]);
    });

  return {
    createWebsite,
    getWebsiteById,
    getWebsiteBySalonId,
    getWebsiteBySlug,
    hasWebsiteForSalonId,
    updateWebsite,
  } satisfies WebsitePort;
});

/**
 * Layer that provides the PostgreSQL WebsiteRepository implementation.
 */
export const PostgresWebsiteAdapter = Layer.effect(WebsitePort, make);
