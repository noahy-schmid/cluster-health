import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
} from "../application/service/service.aggregate";
import { InternalError, NotFoundError } from "../application/service/errors";

// --- Query DTO ---

export interface GetServiceDefinitionQuery {
  serviceId: string;
}

// --- Result DTO ---

export type GetServiceDefinitionResult = ServiceDefinition;

// --- Use Case ---

/**
 * Retrieves a single service definition by its ID.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;

  return {
    /**
     * @param query - The query containing the serviceId.
     * @returns Effect resolving to the found service definition.
     */
    execute: (
      query: GetServiceDefinitionQuery,
    ): Effect.Effect<
      GetServiceDefinitionResult,
      InternalError | NotFoundError
    > => aggregate.findServiceDefinition(query.serviceId),
  };
});

export class GetServiceDefinitionUseCase extends Effect.Service<GetServiceDefinitionUseCase>()(
  "@repo/salon-domain/GetServiceDefinitionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
