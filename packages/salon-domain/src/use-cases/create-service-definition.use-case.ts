import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
  type CreateServicePhaseInput,
} from "../application/service/service.aggregate";
import {
  ServiceError,
  ServiceValidationError,
} from "../application/service/errors";

// --- Command DTO ---

export interface CreateServiceDefinitionCommand {
  salonId: string;
  name: string;
  description: string;
  price: string;
  phases: CreateServicePhaseInput[];
}

// --- Result DTO ---

export type CreateServiceDefinitionResult = ServiceDefinition;

// --- Use Case ---

/**
 * Creates a new service definition with its phases. All phases must be provided upfront.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;

  return {
    /**
     * @param command - The service definition creation data including phases.
     * @returns Effect resolving to the created service definition with computed duration.
     */
    execute: (
      command: CreateServiceDefinitionCommand,
    ): Effect.Effect<
      CreateServiceDefinitionResult,
      ServiceError | ServiceValidationError
    > =>
      aggregate.createServiceDefinition({
        salonId: command.salonId,
        name: command.name,
        description: command.description,
        price: command.price,
        phases: command.phases,
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
