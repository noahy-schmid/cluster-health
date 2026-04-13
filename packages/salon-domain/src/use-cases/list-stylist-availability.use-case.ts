import { Effect } from "effect";
import {
  StylistAvailabilityAggregate,
  type StylistAvailability,
} from "../application/stylist-availability/stylist-availability.aggregate";
import type { StylistAvailabilityInternalError } from "../application/stylist-availability/errors";

// --- Query DTO ---

export interface ListStylistAvailabilityQuery {
  stylistId: string;
}

// --- Result DTO ---

export type ListStylistAvailabilityResult = StylistAvailability[];

// --- Use Case ---

/**
 * Lists all weekly availability windows for a stylist, ordered by day of week.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* StylistAvailabilityAggregate;

  return {
    execute: (
      query: ListStylistAvailabilityQuery,
    ): Effect.Effect<
      ListStylistAvailabilityResult,
      StylistAvailabilityInternalError
    > => aggregate.listAvailability(query.stylistId),
  };
});

export class ListStylistAvailabilityUseCase extends Effect.Service<ListStylistAvailabilityUseCase>()(
  "@repo/salon-domain/ListStylistAvailabilityUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [StylistAvailabilityAggregate.Default],
  },
) {}
