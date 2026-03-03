import { Effect, Layer } from "effect";
import { eq, asc } from "drizzle-orm";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Database } from "../infrastructure/database.interface";
import {
  serviceDefinitionsTable,
  servicePhasesTable,
  phaseResourceRequirementsTable,
} from "../schema";
import {
  ServiceDefinitionPort,
  ServiceDefinitionPersistenceError,
  type PortServiceDefinition,
  type PortCreateServiceDefinitionInput,
  type PortUpdateServiceDefinitionInput,
  type PortServicePhase,
} from "../ports/service-definition.port";

/**
 * Helper to fetch phases with their resource requirements for a service definition.
 */
const fetchPhasesForService = (
  db: NodePgDatabase,
  serviceId: string,
): Effect.Effect<PortServicePhase[], ServiceDefinitionPersistenceError> =>
  Effect.gen(function* () {
    const phases = yield* Effect.tryPromise(() =>
      db
        .select()
        .from(servicePhasesTable)
        .where(eq(servicePhasesTable.serviceDefinitionId, serviceId))
        .orderBy(asc(servicePhasesTable.order)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new ServiceDefinitionPersistenceError({
            message: "Failed to fetch service phases",
            cause: error,
          }),
      ),
    );

    const phasesWithResources: PortServicePhase[] = [];
    for (const phase of phases) {
      const requirements = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(phaseResourceRequirementsTable)
          .where(eq(phaseResourceRequirementsTable.phaseId, phase.id)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new ServiceDefinitionPersistenceError({
              message: "Failed to fetch phase resource requirements",
              cause: error,
            }),
        ),
      );

      phasesWithResources.push({
        id: phase.id,
        name: phase.name,
        durationMinutes: phase.durationMinutes,
        order: phase.order,
        requiredResources: requirements.map((r) => ({
          resourceType: r.resourceType,
        })),
      });
    }

    return phasesWithResources;
  });

/**
 * PostgreSQL implementation of the ServiceDefinitionPort using Drizzle ORM.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const createServiceDefinition: ServiceDefinitionPort["createServiceDefinition"] =
    (input: PortCreateServiceDefinitionInput) =>
      Effect.gen(function* () {
        const [created] = yield* Effect.tryPromise(() =>
          db
            .insert(serviceDefinitionsTable)
            .values({
              salonId: input.salonId,
              name: input.name,
              description: input.description,
              price: input.price,
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

        for (const phase of input.phases) {
          const [createdPhase] = yield* Effect.tryPromise(() =>
            db
              .insert(servicePhasesTable)
              .values({
                serviceDefinitionId: created.id,
                name: phase.name,
                durationMinutes: phase.durationMinutes,
                order: phase.order,
              })
              .returning(),
          ).pipe(
            Effect.mapError(
              (error) =>
                new ServiceDefinitionPersistenceError({
                  message: "Failed to create service phase",
                  cause: error,
                }),
            ),
          );

          if (createdPhase && phase.requiredResources.length > 0) {
            yield* Effect.tryPromise(() =>
              db.insert(phaseResourceRequirementsTable).values(
                phase.requiredResources.map((r) => ({
                  phaseId: createdPhase.id,
                  resourceType: r.resourceType,
                })),
              ),
            ).pipe(
              Effect.mapError(
                (error) =>
                  new ServiceDefinitionPersistenceError({
                    message: "Failed to create phase resource requirements",
                    cause: error,
                  }),
              ),
            );
          }
        }

        const phases = yield* fetchPhasesForService(db, created.id);

        return {
          id: created.id,
          salonId: created.salonId,
          name: created.name,
          description: created.description,
          price: created.price,
          phases,
          createdAt: created.createdAt,
          updatedAt: created.updatedAt,
        } satisfies PortServiceDefinition;
      });

  const updateServiceDefinition: ServiceDefinitionPort["updateServiceDefinition"] =
    (serviceId: string, input: PortUpdateServiceDefinitionInput) =>
      Effect.gen(function* () {
        const [updated] = yield* Effect.tryPromise(() =>
          db
            .update(serviceDefinitionsTable)
            .set({
              name: input.name,
              description: input.description,
              price: input.price,
              updatedAt: new Date(),
            })
            .where(eq(serviceDefinitionsTable.id, serviceId))
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

        if (!updated) {
          return null;
        }

        // Delete old phases (cascades to requirements)
        yield* Effect.tryPromise(() =>
          db
            .delete(servicePhasesTable)
            .where(eq(servicePhasesTable.serviceDefinitionId, serviceId)),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to delete old service phases",
                cause: error,
              }),
          ),
        );

        // Insert new phases
        for (const phase of input.phases) {
          const [createdPhase] = yield* Effect.tryPromise(() =>
            db
              .insert(servicePhasesTable)
              .values({
                serviceDefinitionId: serviceId,
                name: phase.name,
                durationMinutes: phase.durationMinutes,
                order: phase.order,
              })
              .returning(),
          ).pipe(
            Effect.mapError(
              (error) =>
                new ServiceDefinitionPersistenceError({
                  message: "Failed to create service phase",
                  cause: error,
                }),
            ),
          );

          if (createdPhase && phase.requiredResources.length > 0) {
            yield* Effect.tryPromise(() =>
              db.insert(phaseResourceRequirementsTable).values(
                phase.requiredResources.map((r) => ({
                  phaseId: createdPhase.id,
                  resourceType: r.resourceType,
                })),
              ),
            ).pipe(
              Effect.mapError(
                (error) =>
                  new ServiceDefinitionPersistenceError({
                    message: "Failed to create phase resource requirements",
                    cause: error,
                  }),
              ),
            );
          }
        }

        const phases = yield* fetchPhasesForService(db, serviceId);

        return {
          id: updated.id,
          salonId: updated.salonId,
          name: updated.name,
          description: updated.description,
          price: updated.price,
          phases,
          createdAt: updated.createdAt,
          updatedAt: updated.updatedAt,
        } satisfies PortServiceDefinition;
      });

  const deleteServiceDefinition: ServiceDefinitionPort["deleteServiceDefinition"] =
    (serviceId: string) =>
      Effect.gen(function* () {
        const rows = yield* Effect.tryPromise(() =>
          db
            .delete(serviceDefinitionsTable)
            .where(eq(serviceDefinitionsTable.id, serviceId))
            .returning(),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to delete service definition",
                cause: error,
              }),
          ),
        );

        return rows.length > 0;
      });

  const findServiceDefinitionById: ServiceDefinitionPort["findServiceDefinitionById"] =
    (serviceId: string) =>
      Effect.gen(function* () {
        const [service] = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(serviceDefinitionsTable)
            .where(eq(serviceDefinitionsTable.id, serviceId)),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to find service definition",
                cause: error,
              }),
          ),
        );

        if (!service) {
          return null;
        }

        const phases = yield* fetchPhasesForService(db, service.id);

        return {
          id: service.id,
          salonId: service.salonId,
          name: service.name,
          description: service.description,
          price: service.price,
          phases,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
        } satisfies PortServiceDefinition;
      });

  const listServiceDefinitionsBySalonId: ServiceDefinitionPort["listServiceDefinitionsBySalonId"] =
    (salonId: string) =>
      Effect.gen(function* () {
        const services = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(serviceDefinitionsTable)
            .where(eq(serviceDefinitionsTable.salonId, salonId)),
        ).pipe(
          Effect.mapError(
            (error) =>
              new ServiceDefinitionPersistenceError({
                message: "Failed to list service definitions",
                cause: error,
              }),
          ),
        );

        const results: PortServiceDefinition[] = [];
        for (const service of services) {
          const phases = yield* fetchPhasesForService(db, service.id);
          results.push({
            id: service.id,
            salonId: service.salonId,
            name: service.name,
            description: service.description,
            price: service.price,
            phases,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
          });
        }

        return results;
      });

  return {
    createServiceDefinition,
    updateServiceDefinition,
    deleteServiceDefinition,
    findServiceDefinitionById,
    listServiceDefinitionsBySalonId,
  } satisfies ServiceDefinitionPort;
});

/**
 * Layer that provides the PostgreSQL ServiceDefinitionPort implementation.
 */
export const PostgresServiceDefinitionAdapter = Layer.effect(
  ServiceDefinitionPort,
  make,
);
