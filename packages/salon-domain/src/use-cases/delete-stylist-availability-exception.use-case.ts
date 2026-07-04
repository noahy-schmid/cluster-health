import { Effect } from "effect";
import { StylistAvailabilityAggregate } from "../application/stylist-availability/stylist-availability.aggregate";
import type {
  StylistAvailabilityNotFoundError,
  StylistAvailabilityInternalError,
} from "../application/stylist-availability/errors";

// --- Command DTO ---

export interface DeleteStylistAvailabilityExceptionCommand {
  id: string;
}

// --- Use Case ---

/**
 * Deletes a date-specific stylist availability exception by its ID.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* StylistAvailabilityAggregate;

  return {
    execute: (
      command: DeleteStylistAvailabilityExceptionCommand,
    ): Effect.Effect<
      void,
      StylistAvailabilityNotFoundError | StylistAvailabilityInternalError
    > => aggregate.deleteException(command.id),
  };
});

export class DeleteStylistAvailabilityExceptionUseCase extends Effect.Service<DeleteStylistAvailabilityExceptionUseCase>()(
  "@repo/salon-domain/DeleteStylistAvailabilityExceptionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [StylistAvailabilityAggregate.Default],
  },
) {}
