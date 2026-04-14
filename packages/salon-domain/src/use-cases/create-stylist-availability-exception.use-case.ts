import { Effect } from "effect";
import {
  StylistAvailabilityAggregate,
  type StylistAvailabilityException,
} from "../application/stylist-availability/stylist-availability.aggregate";
import type {
  StylistAvailabilityValidationError,
  StylistAvailabilityInternalError,
} from "../application/stylist-availability/errors";
import {
  NotFoundError,
  collapseErrorsToInternalError,
} from "../application/errors";
import { StylistPort } from "../ports/stylist.port";

// --- Command DTO ---

export interface CreateStylistAvailabilityExceptionCommand {
  stylistId: string;
  salonId: string;
  /** ISO date string YYYY-MM-DD */
  date: string;
  /** true = stylist is absent all day; false = custom hours apply */
  isAbsent: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

// --- Result DTO ---

export type CreateStylistAvailabilityExceptionResult =
  StylistAvailabilityException;

// --- Use Case ---

/**
 * Creates or replaces a date-specific availability exception for a stylist.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* StylistAvailabilityAggregate;
  const stylistPort = yield* StylistPort;

  return {
    execute: (
      command: CreateStylistAvailabilityExceptionCommand,
    ): Effect.Effect<
      CreateStylistAvailabilityExceptionResult,
      | StylistAvailabilityValidationError
      | StylistAvailabilityInternalError
      | NotFoundError
    > =>
      Effect.gen(function* () {
        const stylist = yield* stylistPort
          .getStylistById(command.stylistId)
          .pipe(
            Effect.mapError(
              collapseErrorsToInternalError(
                "Failed to check stylist existence",
              ),
            ),
          );

        if (!stylist) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Stylist", id: command.stylistId }),
          );
        }

        return yield* aggregate.createException(
          command.stylistId,
          command.salonId,
          command.date,
          command.isAbsent,
          command.startTime,
          command.endTime,
          command.reason,
        );
      }),
  };
});

export class CreateStylistAvailabilityExceptionUseCase extends Effect.Service<CreateStylistAvailabilityExceptionUseCase>()(
  "@repo/salon-domain/CreateStylistAvailabilityExceptionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [StylistAvailabilityAggregate.Default],
  },
) {}
