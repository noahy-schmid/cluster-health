import { Effect, Layer } from "effect";
import { eq, and, isNull } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { serviceDefinitionsTable } from "../schema";
import {
  ServiceDefinitionPort,
  ServiceDefinitionPersistenceError,
} from "../ports/service-definition.port";

/**
 * PostgreSQL implementation of the ServiceDefinitionPort using Drizzle ORM.
 * Handles only the service_definitions table.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const createServiceDefinition: ServiceDefinitionPort["createServiceDefinition"] =
    (input) =>
      Effect.gen(function* () {
        const [created] = yield* Effect.tryPromise(() =>
          db
            .insert(serviceDefinitionsTable)
            .values({
              salonId: input.salonId,
              name: input.name,
              description: input.description,
              priceInCents: input.priceInCents,
            })
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to create service definition",
                cause: error,
              }),
          ),
        );

        if (!created) {
          return yield* Effect.fail(
            new ServiceDefinitionPersistenceError({
              message: "Failed to create service definition: no row returned",
            }),
          );
        }

        return created;
      });

  const updateServiceDefinition: ServiceDefinitionPort["updateServiceDefinition"] =
    (serviceId, input) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .update(serviceDefinitionsTable)
            .set({
              name: input.name,
              description: input.description,
              priceInCents: input.priceInCents,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(serviceDefinitionsTable.id, serviceId),
                isNull(serviceDefinitionsTable.deletedAt),
              ),
            )
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to update service definition",
                cause: error,
              }),
          ),
        );

        return rows[0] ?? null;
      });

  const softDeleteServiceDefinition: ServiceDefinitionPort["softDeleteServiceDefinition"] =
    (serviceId) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .update(serviceDefinitionsTable)
            .set({ deletedAt: new Date() })
            .where(
              and(
                eq(serviceDefinitionsTable.id, serviceId),
                isNull(serviceDefinitionsTable.deletedAt),
              ),
            )
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to soft-delete service definition",
                cause: error,
              }),
          ),
        );

        return rows.length > 0;
      });

  const findServiceDefinitionById: ServiceDefinitionPort["findServiceDefinitionById"] =
    (serviceId) =>
      Effect.gen(function* () {
        const [service] = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(serviceDefinitionsTable)
            .where(
              and(
                eq(serviceDefinitionsTable.id, serviceId),
                isNull(serviceDefinitionsTable.deletedAt),
              ),
            ),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to find service definition",
                cause: error,
              }),
          ),
        );

        return service ?? null;
      });

  const serviceDefinitionExists: ServiceDefinitionPort["serviceDefinitionExists"] =
    (serviceId) =>
      Effect.gen(function* () {
        const [row] = yield* Effect.tryPromise(() =>
          db
            .select({ id: serviceDefinitionsTable.id })
            .from(serviceDefinitionsTable)
            .where(
              and(
                eq(serviceDefinitionsTable.id, serviceId),
                isNull(serviceDefinitionsTable.deletedAt),
              ),
            )
            .limit(1),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to check service definition existence",
                cause: error,
              }),
          ),
        );

        return !!row;
      });

  return {
    createServiceDefinition,
    updateServiceDefinition,
    softDeleteServiceDefinition,
    findServiceDefinitionById,
    serviceDefinitionExists,
  } satisfies ServiceDefinitionPort;
});

/**
 * Layer that provides the PostgreSQL ServiceDefinitionPort implementation.
 */
export const PostgresServiceDefinitionAdapter = Layer.effect(
  ServiceDefinitionPort,
  make,
);
