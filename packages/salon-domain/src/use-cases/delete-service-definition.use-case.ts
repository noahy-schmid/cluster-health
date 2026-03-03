import { Effect } from "effect";
import { ServiceAggregate } from "../application/service/service.aggregate";
import {
  ServiceError,
  ServiceNotFoundError,
} from "../application/service/errors";

// --- Command DTO ---

export interface DeleteServiceDefinitionCommand {
  serviceId: string;
}

// --- Use Case ---

/**
 * Deletes a service definition. Cascade deletes all phases and employee assignments.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;

  return {
    /**
     * @param command - The service definition deletion data.
     * @returns Effect resolving to void on success.
     */
    execute: (
      command: DeleteServiceDefinitionCommand,
    ): Effect.Effect<void, ServiceError | ServiceNotFoundError> =>
      aggregate.deleteServiceDefinition(command.serviceId),
  };
});

export class DeleteServiceDefinitionUseCase extends Effect.Service<DeleteServiceDefinitionUseCase>()(
  "@repo/salon-domain/DeleteServiceDefinitionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
