import { Effect } from "effect";
import { EmployeeServiceAggregate } from "../application/employee-service/employee-service.aggregate";
import { InternalError } from "../application/employee-service/errors";
import { StylistPort } from "../ports/stylist.port";

// --- Query DTO ---

export interface ListServiceEmployeesQuery {
  serviceId: string;
}

// --- Result DTO ---

export interface ServiceEmployeeItem {
  stylistId: string;
  stylistName: string;
  createdAt: Date;
}

export type ListServiceEmployeesResult = ServiceEmployeeItem[];

// --- Use Case ---

/**
 * Lists all employees (stylists) assigned to a given service definition.
 * Enriches each assignment with the stylist name.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;
  const stylistPort = yield* StylistPort;

  return {
    /**
     * @param query - The query containing the serviceId.
     * @returns Effect resolving to an array of enriched employee items.
     */
    execute: (
      query: ListServiceEmployeesQuery,
    ): Effect.Effect<ListServiceEmployeesResult, InternalError> =>
      Effect.gen(function* () {
        const assignments = yield* aggregate.listServiceEmployees(
          query.serviceId,
        );

        if (assignments.length === 0) {
          return [];
        }

        const stylistIds = assignments.map((a) => a.stylistId);

        // Batch fetch all stylists in a single query
        const stylists = yield* stylistPort.getStylistsByIds(stylistIds).pipe(
          Effect.mapError(
            (error) =>
              new InternalError({
                message: `Failed to fetch stylists: ${error.message}`,
                cause: error,
              }),
          ),
        );

        const stylistMap = new Map(stylists.map((s) => [s.id, s.name]));

        return assignments
          .filter((a) => stylistMap.has(a.stylistId))
          .map((a) => ({
            stylistId: a.stylistId,
            stylistName: stylistMap.get(a.stylistId) ?? "",
            createdAt: a.createdAt,
          }));
      }),
  };
});

export class ListServiceEmployeesUseCase extends Effect.Service<ListServiceEmployeesUseCase>()(
  "@repo/salon-domain/ListServiceEmployeesUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [EmployeeServiceAggregate.Default],
  },
) {}
