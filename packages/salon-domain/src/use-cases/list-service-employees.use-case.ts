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

        const results: ServiceEmployeeItem[] = [];

        for (const assignment of assignments) {
          const stylist = yield* stylistPort
            .getStylistById(assignment.stylistId)
            .pipe(
              Effect.mapError(
                (error) =>
                  new InternalError({
                    message: `Failed to fetch stylist: ${error.message}`,
                    cause: error,
                  }),
              ),
            );

          if (stylist) {
            results.push({
              stylistId: assignment.stylistId,
              stylistName: stylist.name,
              createdAt: assignment.createdAt,
            });
          }
        }

        return results;
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
