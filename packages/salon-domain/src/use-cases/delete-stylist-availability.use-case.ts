import { Effect } from "effect";
import { StylistAvailabilityAggregate } from "../application/stylist-availability/stylist-availability.aggregate";
import type {
  StylistAvailabilityValidationError,
  StylistAvailabilityInternalError,
} from "../application/stylist-availability/errors";

// --- Command DTO ---

export interface DeleteStylistAvailabilityCommand {
  stylistId: string;
  dayOfWeek: number;
}

// --- Use Case ---

/**
 * Removes a stylist's availability for a specific day of the week.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* StylistAvailabilityAggregate;

  return {
    execute: (
      command: DeleteStylistAvailabilityCommand,
    ): Effect.Effect<
      void,
      StylistAvailabilityValidationError | StylistAvailabilityInternalError
    > =>
      aggregate.deleteAvailability(command.stylistId, command.dayOfWeek),
  };
});

export class DeleteStylistAvailabilityUseCase extends Effect.Service<DeleteStylistAvailabilityUseCase>()(
  "@repo/salon-domain/DeleteStylistAvailabilityUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [StylistAvailabilityAggregate.Default],
  },
) {}
