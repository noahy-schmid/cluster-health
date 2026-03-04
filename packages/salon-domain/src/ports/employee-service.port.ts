import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortEmployeeServiceAssignment {
  stylistId: string;
  serviceDefinitionId: string;
  createdAt: Date;
}

// --- Port interface ---

/**
 * Port for employee-service assignment persistence operations.
 */
export interface EmployeeServicePort {
  /**
   * Assigns an employee to a service.
   * @param stylistId Stylist ID to assign.
   * @param serviceId Service definition ID to assign.
   * @returns Effect resolving to the created assignment.
   */
  assignEmployee(
    stylistId: string,
    serviceId: string,
  ): Effect.Effect<PortEmployeeServiceAssignment, InfrastructureError>;

  /**
   * Removes an employee from a service.
   * @param stylistId Stylist ID to unassign.
   * @param serviceId Service definition ID to unassign.
   * @returns Effect resolving to true if removed, false if not found.
   */
  unassignEmployee(
    stylistId: string,
    serviceId: string,
  ): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Lists all service IDs assigned to a stylist.
   * @param stylistId Stylist ID to look up.
   * @returns Effect resolving to array of assignments.
   */
  listByEmployee(
    stylistId: string,
  ): Effect.Effect<PortEmployeeServiceAssignment[], InfrastructureError>;

  /**
   * Lists all stylist IDs assigned to a service.
   * @param serviceId Service definition ID to look up.
   * @returns Effect resolving to array of assignments.
   */
  listByService(
    serviceId: string,
  ): Effect.Effect<PortEmployeeServiceAssignment[], InfrastructureError>;

  /**
   * Checks if a specific assignment exists.
   * @param stylistId Stylist ID.
   * @param serviceId Service definition ID.
   * @returns Effect resolving to true if assignment exists.
   */
  assignmentExists(
    stylistId: string,
    serviceId: string,
  ): Effect.Effect<boolean, InfrastructureError>;
}

/**
 * Context tag for the EmployeeServicePort service.
 */
export const EmployeeServicePort = Context.GenericTag<EmployeeServicePort>(
  "@repo/salon-domain/EmployeeServicePort",
);
