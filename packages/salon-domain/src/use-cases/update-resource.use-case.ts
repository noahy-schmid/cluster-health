import { Effect } from "effect";
import {
  ResourceAggregate,
  type Resource,
} from "../application/resource/resource.aggregate";
import {
  InternalError,
  NotFoundError,
  ValidationError,
} from "../application/resource/errors";

// --- Command DTO ---

export interface UpdateResourceCommand {
  salonId: string;
  slug: string;
  name: string;
  amount: number;
}

// --- Result DTO ---

export type UpdateResourceResult = Resource;

// --- Use Case ---

/**
 * Updates a salon resource's name and amount.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ResourceAggregate;

  return {
    /**
     * @param command - The resource update data including resourceId, name, and amount.
     * @returns Effect resolving to the updated resource.
     */
    execute: (
      command: UpdateResourceCommand,
    ): Effect.Effect<
      UpdateResourceResult,
      InternalError | NotFoundError | ValidationError
    > =>
      aggregate.updateResource(
        command.salonId,
        command.slug,
        command.name,
        command.amount,
      ),
  };
});

export class UpdateResourceUseCase extends Effect.Service<UpdateResourceUseCase>()(
  "@repo/salon-domain/UpdateResourceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ResourceAggregate.Default],
  },
) {}
