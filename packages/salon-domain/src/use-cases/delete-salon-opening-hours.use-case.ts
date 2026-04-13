import { Effect } from "effect";
import { OpeningHoursAggregate } from "../application/opening-hours/opening-hours.aggregate";
import type {
  OpeningHoursValidationError,
  OpeningHoursInternalError,
} from "../application/opening-hours/errors";

// --- Command DTO ---

export interface DeleteSalonOpeningHoursCommand {
  salonId: string;
  dayOfWeek: number;
}

// --- Use Case ---

/**
 * Removes opening hours for a specific day of the week (marks the salon closed that day).
 */
const make = Effect.gen(function* () {
  const aggregate = yield* OpeningHoursAggregate;

  return {
    execute: (
      command: DeleteSalonOpeningHoursCommand,
    ): Effect.Effect<
      void,
      OpeningHoursValidationError | OpeningHoursInternalError
    > => aggregate.deleteOpeningHours(command.salonId, command.dayOfWeek),
  };
});

export class DeleteSalonOpeningHoursUseCase extends Effect.Service<DeleteSalonOpeningHoursUseCase>()(
  "@repo/salon-domain/DeleteSalonOpeningHoursUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [OpeningHoursAggregate.Default],
  },
) {}
