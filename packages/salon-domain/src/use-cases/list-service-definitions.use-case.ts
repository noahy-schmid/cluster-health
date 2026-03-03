import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
} from "../application/service/service.aggregate";
import { ServiceError } from "../application/service/errors";

// --- Query DTO ---

export interface ListServiceDefinitionsQuery {
  salonId: string;
}

// --- Result DTO ---

export type ListServiceDefinitionsResult = ServiceDefinition[];

// --- Use Case ---

/**
 * Lists all service definitions for a salon, including computed duration.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;

  return {
    /**
     * @param query - The query containing the salonId.
     * @returns Effect resolving to an array of service definitions.
     */
    execute: (
      query: ListServiceDefinitionsQuery,
    ): Effect.Effect<ListServiceDefinitionsResult, ServiceError> =>
      aggregate.listServiceDefinitions(query.salonId),
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
