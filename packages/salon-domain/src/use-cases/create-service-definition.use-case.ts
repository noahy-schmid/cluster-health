import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
  type CreateServicePhaseInput,
} from "../application/service/service.aggregate";
import { InternalError, ValidationError } from "../application/service/errors";
import { ValidateServiceResourcesDomainService } from "../application/domain-services/validate-service-resources.domain-service";

// --- Command DTO ---

export interface CreateServiceDefinitionCommand {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}

// --- Result DTO ---

export type CreateServiceDefinitionResult = ServiceDefinition;

// --- Use Case ---

/**
 * Creates a new service definition with its phases. All phases must be provided upfront.
 * Validates that all referenced resources exist and belong to the same salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const validateResources = yield* ValidateServiceResourcesDomainService;

  return {
    /**
     * @param command - The service definition creation data including phases.
     * @returns Effect resolving to the created service definition with computed duration.
     */
    execute: (
      command: CreateServiceDefinitionCommand,
    ): Effect.Effect<
      CreateServiceDefinitionResult,
      InternalError | ValidationError
    > =>
      Effect.gen(function* () {
        // Validate resources exist and belong to the same salon
        const allResourceIds = command.phases.flatMap(
          (p) => p.requiredResourceIds,
        );
        yield* validateResources.validate(command.salonId, allResourceIds);

        return yield* aggregate.createServiceDefinition({
          salonId: command.salonId,
          name: command.name,
          description: command.description,
          priceInCents: command.priceInCents,
          phases: command.phases,
        });
      }),
  };
});

export class CreateServiceDefinitionUseCase extends Effect.Service<CreateServiceDefinitionUseCase>()(
  "@repo/salon-domain/CreateServiceDefinitionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
