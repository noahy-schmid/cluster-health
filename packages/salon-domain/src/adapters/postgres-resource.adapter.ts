import { Effect, Layer } from "effect";
import { eq, inArray } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { salonResourcesTable } from "../schema";
import { ResourcePort } from "../ports/resource.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the ResourcePort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const createResource: ResourcePort["createResource"] = (input) =>
    Effect.gen(function* () {
      const [created] = yield* Effect.tryPromise(() =>
        db.insert(salonResourcesTable).values(input).returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to create resource",
              cause: error,
            }),
        ),
      );

      if (!created) {
        return yield* Effect.fail(
          new InfrastructureError({
            message: "Failed to create resource: no row returned",
          }),
        );
      }

      return created;
    });

  const updateResource: ResourcePort["updateResource"] = (resourceId, input) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .update(salonResourcesTable)
          .set({
            name: input.name,
            amount: input.amount,
            updatedAt: new Date(),
          })
          .where(eq(salonResourcesTable.id, resourceId))
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to update resource",
              cause: error,
            }),
        ),
      );

      return rows[0] ?? null;
    });

  const deleteResource: ResourcePort["deleteResource"] = (resourceId) =>
    Effect.gen(function* () {
      const rows = yield* Effect.tryPromise(() =>
        db
          .delete(salonResourcesTable)
          .where(eq(salonResourcesTable.id, resourceId))
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to delete resource",
              cause: error,
            }),
        ),
      );

      return rows.length > 0;
    });

  const findResourceById: ResourcePort["findResourceById"] = (resourceId) =>
    Effect.gen(function* () {
      const [resource] = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(salonResourcesTable)
          .where(eq(salonResourcesTable.id, resourceId)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to find resource",
              cause: error,
            }),
        ),
      );

      return resource ?? null;
    });

  const listResourcesBySalonId: ResourcePort["listResourcesBySalonId"] = (
    salonId,
  ) =>
    Effect.gen(function* () {
      const resources = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(salonResourcesTable)
          .where(eq(salonResourcesTable.salonId, salonId)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to list resources",
              cause: error,
            }),
        ),
      );

      return resources;
    });

  const findResourcesByIds: ResourcePort["findResourcesByIds"] = (
    resourceIds,
  ) =>
    Effect.gen(function* () {
      if (resourceIds.length === 0) {
        return [];
      }

      const resources = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(salonResourcesTable)
          .where(inArray(salonResourcesTable.id, resourceIds)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to find resources by IDs",
              cause: error,
            }),
        ),
      );

      return resources;
    });

  return {
    createResource,
    updateResource,
    deleteResource,
    findResourceById,
    listResourcesBySalonId,
    findResourcesByIds,
  } satisfies ResourcePort;
});

/**
 * Layer that provides the PostgreSQL ResourcePort implementation.
 */
export const PostgresResourceAdapter = Layer.effect(ResourcePort, make);
