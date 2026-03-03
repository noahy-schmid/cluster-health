import { Effect } from "effect";
import {
  ResourceAggregate,
  type Resource,
} from "../application/resource/resource.aggregate";
import { InternalError, ValidationError } from "../application/resource/errors";

// --- Command DTO ---

export interface CreateResourceCommand {
  salonId: string;
  name: string;
  amount: number;
}

// --- Result DTO ---

export type CreateResourceResult = Resource;

// --- Use Case ---

/**
 * Creates a new salon resource with the given name and amount.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ResourceAggregate;

  return {
    /**
     * @param command - The resource creation data including salonId, name, and amount.
     * @returns Effect resolving to the created resource.
     */
    execute: (
      command: CreateResourceCommand,
    ): Effect.Effect<CreateResourceResult, InternalError | ValidationError> =>
      aggregate.createResource(command.salonId, command.name, command.amount),
  };
});

export class CreateResourceUseCase extends Effect.Service<CreateResourceUseCase>()(
  "@repo/salon-domain/CreateResourceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ResourceAggregate.Default],
  },
) {}
