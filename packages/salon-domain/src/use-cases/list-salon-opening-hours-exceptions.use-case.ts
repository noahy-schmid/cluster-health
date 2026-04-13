import { Effect } from "effect";
import {
  OpeningHoursAggregate,
  type OpeningHoursException,
} from "../application/opening-hours/opening-hours.aggregate";
import type { OpeningHoursInternalError } from "../application/opening-hours/errors";

// --- Query DTO ---

export interface ListSalonOpeningHoursExceptionsQuery {
  salonId: string;
}

// --- Result DTO ---

export type ListSalonOpeningHoursExceptionsResult = OpeningHoursException[];

// --- Use Case ---

/**
 * Lists all date-specific opening hours exceptions for a salon, ordered by date.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* OpeningHoursAggregate;

  return {
    execute: (
      query: ListSalonOpeningHoursExceptionsQuery,
    ): Effect.Effect<
      ListSalonOpeningHoursExceptionsResult,
      OpeningHoursInternalError
    > => aggregate.listExceptions(query.salonId),
  };
});

export class ListSalonOpeningHoursExceptionsUseCase extends Effect.Service<ListSalonOpeningHoursExceptionsUseCase>()(
  "@repo/salon-domain/ListSalonOpeningHoursExceptionsUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [OpeningHoursAggregate.Default],
  },
) {}
