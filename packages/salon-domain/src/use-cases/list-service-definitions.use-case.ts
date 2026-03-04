import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
} from "../application/service/service.aggregate";
import { InternalError } from "../application/service/errors";

// --- Query DTO ---

export interface ListServiceDefinitionsQuery {
  salonId: string;
  /** When true (default), excludes soft-deleted services. Set to false to include them. */
  excludeDeleted?: boolean;
}

// --- Result DTO ---

export type ListServiceDefinitionsResult = ServiceDefinition[];

// --- Use Case ---

/**
 * Lists service definitions for a salon. By default excludes soft-deleted services.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;

  return {
    /**
     * @param query - The query containing the salonId and optional excludeDeleted flag.
     * @returns Effect resolving to an array of service definitions.
     */
    execute: (
      query: ListServiceDefinitionsQuery,
    ): Effect.Effect<ListServiceDefinitionsResult, InternalError> => {
      const excludeDeleted = query.excludeDeleted ?? true;
      return aggregate.listServiceDefinitions(query.salonId, {
        includeDeleted: !excludeDeleted,
      });
    },
  };
});

export class ListServiceDefinitionsUseCase extends Effect.Service<ListServiceDefinitionsUseCase>()(
  "@repo/salon-domain/ListServiceDefinitionsUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
