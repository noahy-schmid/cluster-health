import { Effect } from "effect";
import {
  EmployeeServiceAggregate,
  type EmployeeServiceAssignment,
} from "../application/employee-service/employee-service.aggregate";
import {
  EmployeeServiceError,
  EmployeeServiceAlreadyAssignedError,
} from "../application/employee-service/errors";

// --- Command DTO ---

export interface AssignEmployeeToServiceCommand {
  stylistId: string;
  serviceId: string;
}

// --- Result DTO ---

export type AssignEmployeeToServiceResult = EmployeeServiceAssignment;

// --- Use Case ---

/**
 * Assigns an employee (stylist) to a service definition.
 * Validates that both the stylist and service exist before creating the assignment.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;

  return {
    /**
     * @param command - The assignment data including stylistId and serviceId.
     * @returns Effect resolving to the created assignment.
     */
    execute: (
      command: AssignEmployeeToServiceCommand,
    ): Effect.Effect<
      AssignEmployeeToServiceResult,
      EmployeeServiceError | EmployeeServiceAlreadyAssignedError
    > => aggregate.assignEmployee(command.stylistId, command.serviceId),
  };
});

export class AssignEmployeeToServiceUseCase extends Effect.Service<AssignEmployeeToServiceUseCase>()(
  "@repo/salon-domain/AssignEmployeeToServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [EmployeeServiceAggregate.Default],
  },
) {}
