import { Effect, Layer } from "effect";
import {
  ServiceDefinitionPort,
  type PortServiceDefinition,
  type PortServicePhase,
} from "../../ports/service-definition.port";
import {
  ServiceError,
  ServiceNotFoundError,
  ServiceValidationError,
} from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresServiceDefinitionAdapter } from "../../adapters/postgres-service-definition.adapter";

// --- Domain types ---

export interface PhaseResourceRequirement {
  resourceType: string;
}

export interface ServicePhase {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  requiredResources: PhaseResourceRequirement[];
}

export interface ServiceDefinition {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: string;
  durationMinutes: number;
  phases: ServicePhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateServicePhaseInput {
  name: string;
  durationMinutes: number;
  requiredResources: PhaseResourceRequirement[];
}

export interface CreateServiceInput {
  salonId: string;
  name: string;
  description: string;
  price: string;
  phases: CreateServicePhaseInput[];
}

export interface UpdateServiceInput {
  name: string;
  description: string;
  price: string;
  phases: CreateServicePhaseInput[];
}

// --- Mapping helpers ---

const fromPortPhase = (portPhase: PortServicePhase): ServicePhase => ({
  id: portPhase.id,
  name: portPhase.name,
  durationMinutes: portPhase.durationMinutes,
  order: portPhase.order,
  requiredResources: portPhase.requiredResources,
});

const fromPort = (portService: PortServiceDefinition): ServiceDefinition => ({
  id: portService.id,
  salonId: portService.salonId,
  name: portService.name,
  description: portService.description,
  price: portService.price,
  durationMinutes: portService.phases.reduce(
    (total, phase) => total + phase.durationMinutes,
    0,
  ),
  phases: portService.phases.map(fromPortPhase),
  createdAt: portService.createdAt,
  updatedAt: portService.updatedAt,
});

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const servicePort = yield* ServiceDefinitionPort;

  const createServiceDefinition = (input: CreateServiceInput) =>
    Effect.gen(function* () {
      if (!input.name.trim()) {
        return yield* Effect.fail(
          new ServiceValidationError({
            message: "Service name cannot be empty",
          }),
        );
      }
      if (input.phases.length === 0) {
        return yield* Effect.fail(
          new ServiceValidationError({
            message: "Service must have at least one phase",
          }),
        );
      }
      for (const phase of input.phases) {
        if (!phase.name.trim()) {
          return yield* Effect.fail(
            new ServiceValidationError({
              message: "Phase name cannot be empty",
            }),
          );
        }
        if (phase.durationMinutes < 1) {
          return yield* Effect.fail(
            new ServiceValidationError({
              message: "Phase duration must be at least 1 minute",
            }),
          );
        }
      }

      const portResult = yield* servicePort
        .createServiceDefinition({
          salonId: input.salonId,
          name: input.name.trim(),
          description: input.description.trim(),
          price: input.price,
          phases: input.phases.map((phase, index) => ({
            name: phase.name.trim(),
            durationMinutes: phase.durationMinutes,
            order: index,
            requiredResources: phase.requiredResources,
          })),
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new ServiceError({
                salonId: input.salonId,
                message: error.message,
              }),
          ),
        );

      yield* Effect.log("Service definition created", portResult.id);
      return fromPort(portResult);
    });

  const updateServiceDefinition = (
    serviceId: string,
    input: UpdateServiceInput,
  ) =>
    Effect.gen(function* () {
      if (!input.name.trim()) {
        return yield* Effect.fail(
          new ServiceValidationError({
            message: "Service name cannot be empty",
          }),
        );
      }
      if (input.phases.length === 0) {
        return yield* Effect.fail(
          new ServiceValidationError({
            message: "Service must have at least one phase",
          }),
        );
      }
      for (const phase of input.phases) {
        if (!phase.name.trim()) {
          return yield* Effect.fail(
            new ServiceValidationError({
              message: "Phase name cannot be empty",
            }),
          );
        }
        if (phase.durationMinutes < 1) {
          return yield* Effect.fail(
            new ServiceValidationError({
              message: "Phase duration must be at least 1 minute",
            }),
          );
        }
      }

      const portResult = yield* servicePort
        .updateServiceDefinition(serviceId, {
          name: input.name.trim(),
          description: input.description.trim(),
          price: input.price,
          phases: input.phases.map((phase, index) => ({
            name: phase.name.trim(),
            durationMinutes: phase.durationMinutes,
            order: index,
            requiredResources: phase.requiredResources,
          })),
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new ServiceError({
                serviceId,
                message: error.message,
              }),
          ),
        );

      if (!portResult) {
        return yield* Effect.fail(new ServiceNotFoundError({ serviceId }));
      }

      yield* Effect.log("Service definition updated", serviceId);
      return fromPort(portResult);
    });

  const deleteServiceDefinition = (serviceId: string) =>
    Effect.gen(function* () {
      const deleted = yield* servicePort
        .deleteServiceDefinition(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new ServiceError({
                serviceId,
                message: error.message,
              }),
          ),
        );

      if (!deleted) {
        return yield* Effect.fail(new ServiceNotFoundError({ serviceId }));
      }

      yield* Effect.log("Service definition deleted", serviceId);
    });

  const findServiceDefinition = (serviceId: string) =>
    Effect.gen(function* () {
      const portResult = yield* servicePort
        .findServiceDefinitionById(serviceId)
        .pipe(
          Effect.mapError(
            (error) =>
              new ServiceError({
                serviceId,
                message: error.message,
              }),
          ),
        );

      if (!portResult) {
        return yield* Effect.fail(new ServiceNotFoundError({ serviceId }));
      }

      return fromPort(portResult);
    });

  const listServiceDefinitions = (salonId: string) =>
    Effect.gen(function* () {
      const portResults = yield* servicePort
        .listServiceDefinitionsBySalonId(salonId)
        .pipe(
          Effect.mapError(
            (error) =>
              new ServiceError({
                salonId,
                message: error.message,
              }),
          ),
        );

      return portResults.map(fromPort);
    });

  return {
    createServiceDefinition,
    updateServiceDefinition,
    deleteServiceDefinition,
    findServiceDefinition,
    listServiceDefinitions,
  };
});

export class ServiceAggregate extends Effect.Service<ServiceAggregate>()(
  "@repo/salon-domain/ServiceAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresServiceDefinitionAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
