import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
  type CreateServicePhaseInput,
} from "../application/service/service.aggregate";
import {
  InternalError,
  NotFoundError,
  ValidationError,
} from "../application/service/errors";
import { ServiceDefinitionPort } from "../ports/service-definition.port";
import { ValidateServiceResourcesDomainService } from "../application/domain-services/validate-service-resources.domain-service";

// --- Command DTO ---

export interface UpdateServiceDefinitionCommand {
  serviceId: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}

// --- Result DTO ---

export type UpdateServiceDefinitionResult = ServiceDefinition;

// --- Use Case ---

/**
 * Updates a service definition and replaces all its phases.
 * Validates that all referenced resources exist and belong to the same salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const serviceDefPort = yield* ServiceDefinitionPort;
  const validateResources = yield* ValidateServiceResourcesDomainService;

  return {
    /**
     * @param command - The service definition update data including new phases.
     * @returns Effect resolving to the updated service definition with computed duration.
     */
    execute: (
      command: UpdateServiceDefinitionCommand,
    ): Effect.Effect<
      UpdateServiceDefinitionResult,
      InternalError | NotFoundError | ValidationError
    > =>
      Effect.gen(function* () {
        // Look up the service to get its salonId
        const serviceDef = yield* serviceDefPort
          .findServiceDefinitionById(command.serviceId)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to fetch service: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        if (!serviceDef) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "ServiceDefinition",
              id: command.serviceId,
            }),
          );
        }

        // Validate resources exist and belong to the same salon
        const allResourceIds = command.phases.flatMap(
          (p) => p.requiredResourceIds,
        );
        yield* validateResources.validate(serviceDef.salonId, allResourceIds);

        return yield* aggregate.updateServiceDefinition(command.serviceId, {
          name: command.name,
          description: command.description,
          priceInCents: command.priceInCents,
          phases: command.phases,
        });
      }),
  };
});

export class UpdateServiceDefinitionUseCase extends Effect.Service<UpdateServiceDefinitionUseCase>()(
  "@repo/salon-domain/UpdateServiceDefinitionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
