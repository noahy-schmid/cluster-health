import { Effect } from "effect";
import {
  EmployeeServiceAggregate,
  type EmployeeServiceAssignment,
} from "../application/employee-service/employee-service.aggregate";
import { EmployeeServiceError } from "../application/employee-service/errors";

// --- Query DTO ---

export interface ListEmployeeServicesQuery {
  stylistId: string;
}

// --- Result DTO ---

export type ListEmployeeServicesResult = EmployeeServiceAssignment[];

// --- Use Case ---

/**
 * Lists all service definitions assigned to a given employee (stylist).
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;

  return {
    /**
     * @param query - The query containing the stylistId.
     * @returns Effect resolving to an array of assignments.
     */
    execute: (
      query: ListEmployeeServicesQuery,
    ): Effect.Effect<ListEmployeeServicesResult, EmployeeServiceError> =>
      aggregate.listEmployeeServices(query.stylistId),
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
