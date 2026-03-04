import { Effect } from "effect";
import { EmployeeServiceAggregate } from "../application/employee-service/employee-service.aggregate";
import { InternalError } from "../application/employee-service/errors";
import { ServiceDefinitionPort } from "../ports/service-definition.port";

// --- Query DTO ---

export interface ListEmployeeServicesQuery {
  stylistId: string;
}

// --- Result DTO ---

export interface EmployeeServiceItem {
  serviceDefinitionId: string;
  serviceName: string;
  createdAt: Date;
}

export type ListEmployeeServicesResult = EmployeeServiceItem[];

// --- Use Case ---

/**
 * Lists all service definitions assigned to a given employee (stylist).
 * Enriches each assignment with the service name and filters out deleted services.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;
  const serviceDefPort = yield* ServiceDefinitionPort;

  return {
    /**
     * @param query - The query containing the stylistId.
     * @returns Effect resolving to an array of enriched service items.
     */
    execute: (
      query: ListEmployeeServicesQuery,
    ): Effect.Effect<ListEmployeeServicesResult, InternalError> =>
      Effect.gen(function* () {
        const assignments = yield* aggregate.listEmployeeServices(
          query.stylistId,
        );

        if (assignments.length === 0) {
          return [];
        }

        const serviceIds = assignments.map((a) => a.serviceDefinitionId);

        // Fetch non-deleted service definitions
        const services = yield* serviceDefPort
          .findServiceDefinitionsByIds(serviceIds)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to fetch service names: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        const serviceMap = new Map(services.map((s) => [s.id, s.name]));

        // Only return assignments for non-deleted services
        return assignments
          .filter((a) => serviceMap.has(a.serviceDefinitionId))
          .map((a) => ({
            serviceDefinitionId: a.serviceDefinitionId,
            serviceName: serviceMap.get(a.serviceDefinitionId)!,
            createdAt: a.createdAt,
          }));
      }),
  };
});

export class ListEmployeeServicesUseCase extends Effect.Service<ListEmployeeServicesUseCase>()(
  "@repo/salon-domain/ListEmployeeServicesUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [EmployeeServiceAggregate.Default],
  },
) {}
