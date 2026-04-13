import { Effect } from "effect";
import {
  OpeningHoursAggregate,
  type OpeningHours,
} from "../application/opening-hours/opening-hours.aggregate";
import type {
  OpeningHoursValidationError,
  OpeningHoursInternalError,
} from "../application/opening-hours/errors";
import { NotFoundError, collapseErrorsToInternalError } from "../application/errors";
import { SalonPort } from "../ports/salon.port";

// --- Command DTO ---

export interface SetSalonOpeningHoursCommand {
  salonId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

// --- Result DTO ---

export type SetSalonOpeningHoursResult = OpeningHours;

// --- Use Case ---

/**
 * Sets (creates or replaces) the opening hours for a specific day of the week for a salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* OpeningHoursAggregate;
  const salonPort = yield* SalonPort;

  return {
    execute: (
      command: SetSalonOpeningHoursCommand,
    ): Effect.Effect<
      SetSalonOpeningHoursResult,
      OpeningHoursValidationError | OpeningHoursInternalError | NotFoundError
    > =>
      Effect.gen(function* () {
        const salonExists = yield* salonPort
          .salonExists(command.salonId)
          .pipe(
            Effect.mapError(
              collapseErrorsToInternalError("Failed to check salon existence"),
            ),
          );

        if (!salonExists) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Salon", id: command.salonId }),
          );
        }

        return yield* aggregate.setOpeningHours(
          command.salonId,
          command.dayOfWeek,
          command.openTime,
          command.closeTime,
        );
      }),
  };
});

export class SetSalonOpeningHoursUseCase extends Effect.Service<SetSalonOpeningHoursUseCase>()(
  "@repo/salon-domain/SetSalonOpeningHoursUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [OpeningHoursAggregate.Default],
  },
) {}
