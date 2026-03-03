import { Effect } from "effect";
import { ResourceAggregate } from "../application/resource/resource.aggregate";
import {
  InternalError,
  NotFoundError,
  ConflictError,
} from "../application/resource/errors";
import { ServicePhasePort } from "../ports/service-phase.port";

// --- Command DTO ---

export interface DeleteResourceCommand {
  resourceId: string;
}

// --- Use Case ---

/**
 * Deletes a salon resource. Performs cross-aggregate validation to ensure
 * the resource is not referenced by any service phase before deletion.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ResourceAggregate;
  const servicePhasePort = yield* ServicePhasePort;

  return {
    /**
     * @param command - The resource deletion data including resourceId.
     * @returns Effect resolving to void on success.
     */
    execute: (
      command: DeleteResourceCommand,
    ): Effect.Effect<void, InternalError | NotFoundError | ConflictError> =>
      Effect.gen(function* () {
        // Cross-aggregate check: is this resource referenced by any service phase?
        const isReferenced = yield* servicePhasePort
          .isResourceReferenced(command.resourceId)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: error.message,
                  cause: error,
                }),
            ),
          );

        if (isReferenced) {
          return yield* Effect.fail(
            new ConflictError({
              message: `Cannot delete resource: it is still referenced by service phases`,
            }),
          );
        }

        yield* aggregate.deleteResource(command.resourceId);
      }),
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
