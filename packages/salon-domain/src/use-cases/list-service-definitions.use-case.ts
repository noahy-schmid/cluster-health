import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
} from "../application/service/service.aggregate";
import { InternalError } from "../application/service/errors";

// --- Query DTO ---

export interface ListServiceDefinitionsQuery {
  salonId: string;
  /** When true, includes soft-deleted services. Defaults to false. */
  includeDeleted?: boolean;
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
     * @param query - The query containing the salonId and optional includeDeleted flag.
     * @returns Effect resolving to an array of service definitions.
     */
    execute: (
      query: ListServiceDefinitionsQuery,
    ): Effect.Effect<ListServiceDefinitionsResult, InternalError> => {
      const includeDeleted = query.includeDeleted ?? false;
      return aggregate.listServiceDefinitions(query.salonId, {
        includeDeleted,
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
