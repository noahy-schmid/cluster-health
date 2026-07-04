import { Effect } from "effect";
import { OpeningHoursAggregate } from "../application/opening-hours/opening-hours.aggregate";
import type {
  OpeningHoursNotFoundError,
  OpeningHoursInternalError,
} from "../application/opening-hours/errors";

// --- Command DTO ---

export interface DeleteSalonOpeningHoursExceptionCommand {
  id: string;
}

// --- Use Case ---

/**
 * Deletes a date-specific opening hours exception by its ID.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* OpeningHoursAggregate;

  return {
    execute: (
      command: DeleteSalonOpeningHoursExceptionCommand,
    ): Effect.Effect<
      void,
      OpeningHoursNotFoundError | OpeningHoursInternalError
    > => aggregate.deleteException(command.id),
  };
});

export class DeleteSalonOpeningHoursExceptionUseCase extends Effect.Service<DeleteSalonOpeningHoursExceptionUseCase>()(
  "@repo/salon-domain/DeleteSalonOpeningHoursExceptionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [OpeningHoursAggregate.Default],
  },
) {}
