import { Effect } from "effect";
import {
  OpeningHoursAggregate,
  type OpeningHoursException,
} from "../application/opening-hours/opening-hours.aggregate";
import type {
  OpeningHoursValidationError,
  OpeningHoursInternalError,
} from "../application/opening-hours/errors";
import { NotFoundError, collapseErrorsToInternalError } from "../application/errors";
import { SalonPort } from "../ports/salon.port";

// --- Command DTO ---

export interface CreateSalonOpeningHoursExceptionCommand {
  salonId: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** true = salon is closed that day; false = custom hours apply */
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  reason?: string | null;
}

// --- Result DTO ---

export type CreateSalonOpeningHoursExceptionResult = OpeningHoursException;

// --- Use Case ---

/**
 * Creates or replaces a date-specific opening hours exception for a salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* OpeningHoursAggregate;
  const salonPort = yield* SalonPort;

  return {
    execute: (
      command: CreateSalonOpeningHoursExceptionCommand,
    ): Effect.Effect<
      CreateSalonOpeningHoursExceptionResult,
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

        return yield* aggregate.createException(
          command.salonId,
          command.date,
          command.isClosed,
          command.openTime,
          command.closeTime,
          command.reason,
        );
      }),
  };
});

export class CreateSalonOpeningHoursExceptionUseCase extends Effect.Service<CreateSalonOpeningHoursExceptionUseCase>()(
  "@repo/salon-domain/CreateSalonOpeningHoursExceptionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [OpeningHoursAggregate.Default],
  },
) {}
