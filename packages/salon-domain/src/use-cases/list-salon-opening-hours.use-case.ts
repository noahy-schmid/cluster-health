import { Effect } from "effect";
import {
  OpeningHoursAggregate,
  type OpeningHours,
} from "../application/opening-hours/opening-hours.aggregate";
import type { OpeningHoursInternalError } from "../application/opening-hours/errors";

// --- Query DTO ---

export interface ListSalonOpeningHoursQuery {
  salonId: string;
}

// --- Result DTO ---

export type ListSalonOpeningHoursResult = OpeningHours[];

// --- Use Case ---

/**
 * Lists all weekly opening hours for a salon, ordered by day of week.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* OpeningHoursAggregate;

  return {
    execute: (
      query: ListSalonOpeningHoursQuery,
    ): Effect.Effect<ListSalonOpeningHoursResult, OpeningHoursInternalError> =>
      aggregate.listOpeningHours(query.salonId),
  };
});

export class ListSalonOpeningHoursUseCase extends Effect.Service<ListSalonOpeningHoursUseCase>()(
  "@repo/salon-domain/ListSalonOpeningHoursUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [OpeningHoursAggregate.Default],
  },
) {}
