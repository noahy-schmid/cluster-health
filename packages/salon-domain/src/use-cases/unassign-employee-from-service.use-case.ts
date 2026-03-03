import { Effect } from "effect";
import { EmployeeServiceAggregate } from "../application/employee-service/employee-service.aggregate";
import {
  InternalError,
  NotFoundError,
} from "../application/employee-service/errors";

// --- Command DTO ---

export interface UnassignEmployeeFromServiceCommand {
  stylistId: string;
  serviceId: string;
}

// --- Use Case ---

/**
 * Removes an employee (stylist) assignment from a service definition.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* EmployeeServiceAggregate;

  return {
    /**
     * @param command - The unassignment data including stylistId and serviceId.
     * @returns Effect resolving to void on success.
     */
    execute: (
      command: UnassignEmployeeFromServiceCommand,
    ): Effect.Effect<void, InternalError | NotFoundError> =>
      aggregate.unassignEmployee(command.stylistId, command.serviceId),
  };
});

export class UnassignEmployeeFromServiceUseCase extends Effect.Service<UnassignEmployeeFromServiceUseCase>()(
  "@repo/salon-domain/UnassignEmployeeFromServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [EmployeeServiceAggregate.Default],
  },
) {}
