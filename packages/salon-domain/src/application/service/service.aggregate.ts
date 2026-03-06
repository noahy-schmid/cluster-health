import { Effect, Layer } from "effect";
import { ServiceDefinitionPort } from "../../ports/service-definition.port";
import { ServicePhasePort } from "../../ports/service-phase.port";
import {
  ReadServicePort,
  type PortFullServiceDefinition,
} from "../../ports/read-service.port";
import { InternalError, NotFoundError, ValidationError } from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresServiceDefinitionAdapter } from "../../adapters/postgres-service-definition.adapter";
import { PostgresServicePhaseAdapter } from "../../adapters/postgres-service-phase.adapter";
import { PostgresReadServiceAdapter } from "../../adapters/postgres-read-service.adapter";

// --- Domain types ---

export interface ServicePhase {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  employeeRequired: boolean;
  requiredResourceSlugs: string[];
}

export interface ServiceDefinition {
  id: string;
  salonId: string;
  serviceType: string;
  name: string;
  description: string;
  priceInCents: number;
  durationMinutes: number;
  phases: ServicePhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServicePhaseInput {
  name: string;
  durationMinutes: number;
  employeeRequired: boolean;
  requiredResourceSlugs: string[];
}

export interface CreateServiceInput {
  salonId: string;
  serviceType: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}

export interface UpdateServiceInput {
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}

// --- Mapping helper ---

const fromPort = (
  portService: PortFullServiceDefinition,
): ServiceDefinition => ({
  id: portService.id,
  salonId: portService.salonId,
  serviceType: portService.serviceType,
  name: portService.name,
  description: portService.description,
  priceInCents: portService.priceInCents,
  durationMinutes: portService.phases.reduce(
    (total, phase) => total + phase.durationMinutes,
    0,
  ),
  phases: portService.phases.map((p) => ({
    id: p.id,
    name: p.name,
    durationMinutes: p.durationMinutes,
    order: p.order,
    employeeRequired: p.employeeRequired,
    requiredResourceSlugs: p.requiredResourceSlugs,
  })),
  createdAt: portService.createdAt,
  updatedAt: portService.updatedAt,
});

// --- Phase validation helper ---

const validatePhases = (
  phases: CreateServicePhaseInput[],
): Effect.Effect<void, ValidationError> =>
  Effect.gen(function* () {
    if (phases.length === 0) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Service must have at least one phase",
        }),
      );
    }
    for (const phase of phases) {
      if (!phase.name.trim()) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Phase name cannot be empty",
          }),
        );
      }
      if (phase.durationMinutes < 1) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Phase duration must be at least 1 minute",
          }),
        );
      }
    }
  });

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const serviceDefPort = yield* ServiceDefinitionPort;
  const servicePhasePort = yield* ServicePhasePort;
  const readServicePort = yield* ReadServicePort;

  const createServiceDefinition = (input: CreateServiceInput) =>
    Effect.gen(function* () {
      if (!input.name.trim()) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Service name cannot be empty",
          }),
        );
      }
      yield* validatePhases(input.phases);

      // Create the definition row
      const created = yield* serviceDefPort
        .createServiceDefinition({
          salonId: input.salonId,
          serviceType: input.serviceType,
          name: input.name.trim(),
          description: input.description.trim(),
          priceInCents: input.priceInCents,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      // Create phases
      for (let i = 0; i < input.phases.length; i++) {
        const phase = input.phases[i]!;
        yield* servicePhasePort
          .createPhase({
            serviceDefinitionId: created.id,
            name: phase.name.trim(),
            durationMinutes: phase.durationMinutes,
            order: i,
            employeeRequired: phase.employeeRequired,
            requiredResourceSlugs: phase.requiredResourceSlugs,
          })
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({ message: error.message, cause: error }),
            ),
          );
      }

      // Read back the full service definition
      const full = yield* readServicePort
        .findFullServiceDefinitionById(created.id)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (!full) {
        return yield* Effect.fail(
          new InternalError({
            message: "Service definition not found after creation",
          }),
        );
      }

      yield* Effect.log("Service definition created", created.id);
      return fromPort(full);
    });

  const updateServiceDefinition = (
    serviceId: string,
    input: UpdateServiceInput,
  ) =>
    Effect.gen(function* () {
      if (!input.name.trim()) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Service name cannot be empty",
          }),
        );
      }
      yield* validatePhases(input.phases);

      // Update the definition row
      const updated = yield* serviceDefPort
        .updateServiceDefinition(serviceId, {
          name: input.name.trim(),
          description: input.description.trim(),
          priceInCents: input.priceInCents,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (!updated) {
        return yield* Effect.fail(
          new NotFoundError({ entity: "ServiceDefinition", id: serviceId }),
        );
      }

      // Replace phases
      yield* servicePhasePort
        .deletePhasesByServiceDefinitionId(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      for (let i = 0; i < input.phases.length; i++) {
        const phase = input.phases[i]!;
        yield* servicePhasePort
          .createPhase({
            serviceDefinitionId: serviceId,
            name: phase.name.trim(),
            durationMinutes: phase.durationMinutes,
            order: i,
            employeeRequired: phase.employeeRequired,
            requiredResourceSlugs: phase.requiredResourceSlugs,
          })
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({ message: error.message, cause: error }),
            ),
          );
      }

      // Read back the full service definition
      const full = yield* readServicePort
        .findFullServiceDefinitionById(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (!full) {
        return yield* Effect.fail(
          new InternalError({
            message: "Service definition not found after update",
          }),
        );
      }

      yield* Effect.log("Service definition updated", serviceId);
      return fromPort(full);
    });

  const softDeleteServiceDefinition = (serviceId: string) =>
    Effect.gen(function* () {
      const deleted = yield* serviceDefPort
        .softDeleteServiceDefinition(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (!deleted) {
        return yield* Effect.fail(
          new NotFoundError({ entity: "ServiceDefinition", id: serviceId }),
        );
      }

      yield* Effect.log("Service definition soft-deleted", serviceId);
    });

  const findServiceDefinition = (serviceId: string) =>
    Effect.gen(function* () {
      const full = yield* readServicePort
        .findFullServiceDefinitionById(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      if (!full) {
        return yield* Effect.fail(
          new NotFoundError({ entity: "ServiceDefinition", id: serviceId }),
        );
      }

      return fromPort(full);
    });

  const listServiceDefinitions = (
    salonId: string,
    options?: { includeDeleted?: boolean },
  ) =>
    Effect.gen(function* () {
      const results = yield* readServicePort
        .listFullServiceDefinitionsBySalonId(salonId, options)
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({ message: error.message, cause: error }),
          ),
        );

      return results.map(fromPort);
    });

  return {
    createServiceDefinition,
    updateServiceDefinition,
    softDeleteServiceDefinition,
    findServiceDefinition,
    listServiceDefinitions,
  };
});

const infraLayer = Layer.mergeAll(
  PostgresServiceDefinitionAdapter,
  PostgresServicePhaseAdapter,
  PostgresReadServiceAdapter,
).pipe(
  Layer.provide(DatabaseLayer),
  Layer.provide(ConfigurationLayer),
  Layer.orDie,
);

export class ServiceAggregate extends Effect.Service<ServiceAggregate>()(
  "@repo/salon-domain/ServiceAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [infraLayer],
  },
) {}
