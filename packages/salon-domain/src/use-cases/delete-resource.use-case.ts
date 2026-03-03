import { Effect } from "effect";
import { ResourceAggregate } from "../application/resource/resource.aggregate";
import {
  ResourceError,
  ResourceNotFoundError,
  ResourceInUseError,
} from "../application/resource/errors";

// --- Command DTO ---

export interface DeleteResourceCommand {
  resourceId: string;
}

// --- Use Case ---

/**
 * Deletes a salon resource. Fails if the resource type is still referenced by service phases.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ResourceAggregate;

  return {
    /**
     * @param command - The resource deletion data including resourceId.
     * @returns Effect resolving to void on success.
     */
    execute: (
      command: DeleteResourceCommand,
    ): Effect.Effect<
      void,
      ResourceError | ResourceNotFoundError | ResourceInUseError
    > => aggregate.deleteResource(command.resourceId),
  };
});

export class DeleteResourceUseCase extends Effect.Service<DeleteResourceUseCase>()(
  "@repo/salon-domain/DeleteResourceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ResourceAggregate.Default],
  },
) {}
