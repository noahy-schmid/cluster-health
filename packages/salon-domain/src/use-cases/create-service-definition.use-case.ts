import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
  type CreateServicePhaseInput,
} from "../application/service/service.aggregate";
import { InternalError, ValidationError } from "../application/service/errors";

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
      InternalError | ValidationError
    > =>
      aggregate.createServiceDefinition({
        salonId: command.salonId,
        name: command.name,
        description: command.description,
        priceInCents: command.priceInCents,
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
