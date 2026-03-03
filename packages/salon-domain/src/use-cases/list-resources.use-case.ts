import { Effect } from "effect";
import {
  ResourceAggregate,
  type Resource,
} from "../application/resource/resource.aggregate";
import { InternalError } from "../application/resource/errors";

// --- Query DTO ---

export interface ListResourcesQuery {
  salonId: string;
}

// --- Result DTO ---

export type ListResourcesResult = Resource[];

// --- Use Case ---

/**
 * Lists all resources for a salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ResourceAggregate;

  return {
    /**
     * @param query - The query containing the salonId.
     * @returns Effect resolving to an array of resources.
     */
    execute: (
      query: ListResourcesQuery,
    ): Effect.Effect<ListResourcesResult, InternalError> =>
      aggregate.listResources(query.salonId),
  };
});

export class ListResourcesUseCase extends Effect.Service<ListResourcesUseCase>()(
  "@repo/salon-domain/ListResourcesUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ResourceAggregate.Default],
  },
) {}
