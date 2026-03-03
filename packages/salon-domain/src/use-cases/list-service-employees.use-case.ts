import { Effect } from "effect";
import {
  EmployeeServiceAggregate,
  type EmployeeServiceAssignment,
} from "../application/employee-service/employee-service.aggregate";
import { EmployeeServiceError } from "../application/employee-service/errors";

// --- Query DTO ---

export interface ListServiceEmployeesQuery {
  serviceId: string;
}

// --- Result DTO ---

export type ListServiceEmployeesResult = EmployeeServiceAssignment[];

// --- Use Case ---

/**
 * Lists all employees (stylists) assigned to a given service definition.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;

  return {
    /**
     * @param query - The query containing the serviceId.
     * @returns Effect resolving to an array of assignments.
     */
    execute: (
      query: ListServiceEmployeesQuery,
    ): Effect.Effect<ListServiceEmployeesResult, EmployeeServiceError> =>
      aggregate.listServiceEmployees(query.serviceId),
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
