import { Effect, Layer } from "effect";
import { eq, asc, and, isNull } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import {
  serviceDefinitionsTable,
  servicePhasesTable,
  phaseResourceRequirementsTable,
} from "../schema";
import {
  ReadServicePort,
  type PortFullServiceDefinition,
  type PortServicePhaseWithResources,
} from "../ports/read-service.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the ReadServicePort using Drizzle ORM.
 * Provides joined reads of service definitions with phases and resource requirements.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const fetchPhasesWithResources = (
    serviceId: string,
  ): Effect.Effect<PortServicePhaseWithResources[], InfrastructureError> =>
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
            new InfrastructureError({
              message: "Failed to fetch service phases",
              cause: error,
            }),
        ),
      );

      const result: PortServicePhaseWithResources[] = [];
      for (const phase of phases) {
        const requirements = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(phaseResourceRequirementsTable)
            .where(eq(phaseResourceRequirementsTable.phaseId, phase.id)),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to fetch phase resource requirements",
                cause: error,
              }),
          ),
        );

        result.push({
          id: phase.id,
          name: phase.name,
          durationMinutes: phase.durationMinutes,
          order: phase.order,
          employeeRequired: phase.employeeRequired,
          requiredResourceSlugs: requirements.map((r) => r.resourceSlug),
        });
      }

      return result;
    });

  const findFullServiceDefinitionById: ReadServicePort["findFullServiceDefinitionById"] =
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
              new InfrastructureError({
                message: "Failed to find service definition",
                cause: error,
              }),
          ),
        );

        if (!service) {
          return null;
        }

        const phases = yield* fetchPhasesWithResources(service.id);

        return {
          id: service.id,
          salonId: service.salonId,
          serviceType: service.serviceType,
          name: service.name,
          description: service.description,
          priceInCents: service.priceInCents,
          phases,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt,
          deletedAt: service.deletedAt,
        } satisfies PortFullServiceDefinition;
      });

  const listFullServiceDefinitionsBySalonId: ReadServicePort["listFullServiceDefinitionsBySalonId"] =
    (salonId, options) =>
      Effect.gen(function* () {
        const includeDeleted = options?.includeDeleted ?? false;

        const whereConditions = includeDeleted
          ? eq(serviceDefinitionsTable.salonId, salonId)
          : and(
              eq(serviceDefinitionsTable.salonId, salonId),
              isNull(serviceDefinitionsTable.deletedAt),
            );

        const services = yield* Effect.tryPromise(() =>
          db.select().from(serviceDefinitionsTable).where(whereConditions),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to list service definitions",
                cause: error,
              }),
          ),
        );

        const results: PortFullServiceDefinition[] = [];
        for (const service of services) {
          const phases = yield* fetchPhasesWithResources(service.id);
          results.push({
            id: service.id,
            salonId: service.salonId,
            serviceType: service.serviceType,
            name: service.name,
            description: service.description,
            priceInCents: service.priceInCents,
            phases,
            createdAt: service.createdAt,
            updatedAt: service.updatedAt,
            deletedAt: service.deletedAt,
          });
        }

        return results;
      });

  return {
    findFullServiceDefinitionById,
    listFullServiceDefinitionsBySalonId,
  } satisfies ReadServicePort;
});

/**
 * Layer that provides the PostgreSQL ReadServicePort implementation.
 */
export const PostgresReadServiceAdapter = Layer.effect(ReadServicePort, make);
