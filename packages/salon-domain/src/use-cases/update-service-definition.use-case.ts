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
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;

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
      aggregate.updateServiceDefinition(command.serviceId, {
        name: command.name,
        description: command.description,
        priceInCents: command.priceInCents,
        phases: command.phases,
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
