import { Effect } from "effect";
import {
  StylistAvailabilityAggregate,
  type StylistAvailability,
} from "../application/stylist-availability/stylist-availability.aggregate";
import type {
  StylistAvailabilityValidationError,
  StylistAvailabilityInternalError,
} from "../application/stylist-availability/errors";
import { NotFoundError, collapseErrorsToInternalError } from "../application/errors";
import { StylistPort } from "../ports/stylist.port";

// --- Command DTO ---

export interface SetStylistAvailabilityCommand {
  stylistId: string;
  salonId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

// --- Result DTO ---

export type SetStylistAvailabilityResult = StylistAvailability;

// --- Use Case ---

/**
 * Sets (creates or replaces) availability for a stylist on a specific day of the week.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* StylistAvailabilityAggregate;
  const stylistPort = yield* StylistPort;

  return {
    execute: (
      command: SetStylistAvailabilityCommand,
    ): Effect.Effect<
      SetStylistAvailabilityResult,
      | StylistAvailabilityValidationError
      | StylistAvailabilityInternalError
      | NotFoundError
    > =>
      Effect.gen(function* () {
        const stylist = yield* stylistPort
          .getStylistById(command.stylistId)
          .pipe(
            Effect.mapError(
              collapseErrorsToInternalError("Failed to check stylist existence"),
            ),
          );

        if (!stylist) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "Stylist",
              id: command.stylistId,
            }),
          );
        }

        return yield* aggregate.setAvailability(
          command.stylistId,
          command.salonId,
          command.dayOfWeek,
          command.startTime,
          command.endTime,
        );
      }),
  };
});

export class SetStylistAvailabilityUseCase extends Effect.Service<SetStylistAvailabilityUseCase>()(
  "@repo/salon-domain/SetStylistAvailabilityUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [StylistAvailabilityAggregate.Default],
  },
) {}
