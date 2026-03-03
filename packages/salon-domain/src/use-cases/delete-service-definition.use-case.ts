import { Effect } from "effect";
import { ServiceAggregate } from "../application/service/service.aggregate";
import { InternalError, NotFoundError } from "../application/service/errors";

// --- Command DTO ---

export interface DeleteServiceDefinitionCommand {
  serviceId: string;
}

// --- Use Case ---

/**
 * Soft-deletes a service definition. The definition is kept in the database
 * with a deletedAt timestamp so that existing bookings can still reference it.
 * Cascade-deleted phases and employee assignments remain as-is since the
 * definition row is preserved.
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
    ): Effect.Effect<void, InternalError | NotFoundError> =>
      aggregate.softDeleteServiceDefinition(command.serviceId),
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
