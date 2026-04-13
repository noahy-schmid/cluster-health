import { Effect } from "effect";
import {
  StylistAvailabilityAggregate,
  type StylistAvailabilityException,
} from "../application/stylist-availability/stylist-availability.aggregate";
import type { StylistAvailabilityInternalError } from "../application/stylist-availability/errors";

// --- Query DTO ---

export interface ListStylistAvailabilityExceptionsQuery {
  stylistId: string;
}

// --- Result DTO ---

export type ListStylistAvailabilityExceptionsResult =
  StylistAvailabilityException[];

// --- Use Case ---

/**
 * Lists all date-specific availability exceptions for a stylist, ordered by date.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* StylistAvailabilityAggregate;

  return {
    execute: (
      query: ListStylistAvailabilityExceptionsQuery,
    ): Effect.Effect<
      ListStylistAvailabilityExceptionsResult,
      StylistAvailabilityInternalError
    > => aggregate.listExceptions(query.stylistId),
  };
});

export class ListStylistAvailabilityExceptionsUseCase extends Effect.Service<ListStylistAvailabilityExceptionsUseCase>()(
  "@repo/salon-domain/ListStylistAvailabilityExceptionsUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [StylistAvailabilityAggregate.Default],
  },
) {}
