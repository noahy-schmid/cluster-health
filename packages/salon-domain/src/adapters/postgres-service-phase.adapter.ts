import { Effect, Layer } from "effect";
import { eq, asc } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";
import { servicePhasesTable, phaseResourceRequirementsTable } from "../schema";
import { ServicePhasePort } from "../ports/service-phase.port";
import { InfrastructureError } from "../application/errors";

/**
 * PostgreSQL implementation of the ServicePhasePort using Drizzle ORM.
 * Handles service_phases and phase_resource_requirements tables.
 */
const make = Effect.gen(function* () {
  const { db } = yield* Database;

  const createPhase: ServicePhasePort["createPhase"] = (input) =>
    Effect.gen(function* () {
      const [created] = yield* Effect.tryPromise(() =>
        db
          .insert(servicePhasesTable)
          .values({
            serviceDefinitionId: input.serviceDefinitionId,
            name: input.name,
            durationMinutes: input.durationMinutes,
            order: input.order,
          })
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to create service phase",
              cause: error,
            }),
        ),
      );

      if (!created) {
        return yield* Effect.fail(
          new InfrastructureError({
            message: "Failed to create service phase: no row returned",
          }),
        );
      }

      if (input.requiredResourceIds.length > 0) {
        yield* Effect.tryPromise(() =>
          db.insert(phaseResourceRequirementsTable).values(
            input.requiredResourceIds.map((resourceId) => ({
              phaseId: created.id,
              resourceId,
            })),
          ),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to create phase resource requirements",
                cause: error,
              }),
          ),
        );
      }

      return created;
    });

  const deletePhasesByServiceDefinitionId: ServicePhasePort["deletePhasesByServiceDefinitionId"] =
    (serviceDefinitionId) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          db
            .delete(servicePhasesTable)
            .where(
              eq(servicePhasesTable.serviceDefinitionId, serviceDefinitionId),
            ),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to delete service phases",
                cause: error,
              }),
          ),
        );
      });

  const listPhasesByServiceDefinitionId: ServicePhasePort["listPhasesByServiceDefinitionId"] =
    (serviceDefinitionId) =>
      Effect.gen(function* () {
        const phases = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(servicePhasesTable)
            .where(
              eq(servicePhasesTable.serviceDefinitionId, serviceDefinitionId),
            )
            .orderBy(asc(servicePhasesTable.order)),
        ).pipe(
          Effect.mapError(
            (error) =>
              new InfrastructureError({
                message: "Failed to list service phases",
                cause: error,
              }),
          ),
        );

        const result: ((typeof phases)[number] & {
          requiredResourceIds: string[];
        })[] = [];

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
            ...phase,
            requiredResourceIds: requirements.map((r) => r.resourceId),
          });
        }

        return result;
      });

  const isResourceReferenced: ServicePhasePort["isResourceReferenced"] = (
    resourceId,
  ) =>
    Effect.gen(function* () {
      const [row] = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(phaseResourceRequirementsTable)
          .where(eq(phaseResourceRequirementsTable.resourceId, resourceId))
          .limit(1),
      ).pipe(
        Effect.mapError(
          (error) =>
            new InfrastructureError({
              message: "Failed to check resource references",
              cause: error,
            }),
        ),
      );

      return !!row;
    });

  return {
    createPhase,
    deletePhasesByServiceDefinitionId,
    listPhasesByServiceDefinitionId,
    isResourceReferenced,
  } satisfies ServicePhasePort;
});

/**
 * Layer that provides the PostgreSQL ServicePhasePort implementation.
 */
export const PostgresServicePhaseAdapter = Layer.effect(ServicePhasePort, make);
