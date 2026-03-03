import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when an employee-service assignment persistence operation fails.
 */
export class EmployeeServicePersistenceError extends Data.TaggedError(
  "EmployeeServicePersistenceError",
)<{
  message: string;
  cause?: unknown;
}> {}

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
  ): Effect.Effect<
    PortEmployeeServiceAssignment,
    EmployeeServicePersistenceError
  >;

  /**
   * Removes an employee from a service.
   * @param stylistId Stylist ID to unassign.
   * @param serviceId Service definition ID to unassign.
   * @returns Effect resolving to true if removed, false if not found.
   */
  unassignEmployee(
    stylistId: string,
    serviceId: string,
  ): Effect.Effect<boolean, EmployeeServicePersistenceError>;

  /**
   * Lists all service IDs assigned to a stylist.
   * @param stylistId Stylist ID to look up.
   * @returns Effect resolving to array of assignments.
   */
  listByEmployee(
    stylistId: string,
  ): Effect.Effect<
    PortEmployeeServiceAssignment[],
    EmployeeServicePersistenceError
  >;

  /**
   * Lists all stylist IDs assigned to a service.
   * @param serviceId Service definition ID to look up.
   * @returns Effect resolving to array of assignments.
   */
  listByService(
    serviceId: string,
  ): Effect.Effect<
    PortEmployeeServiceAssignment[],
    EmployeeServicePersistenceError
  >;

  /**
   * Checks if a specific assignment exists.
   * @param stylistId Stylist ID.
   * @param serviceId Service definition ID.
   * @returns Effect resolving to true if assignment exists.
   */
  assignmentExists(
    stylistId: string,
    serviceId: string,
  ): Effect.Effect<boolean, EmployeeServicePersistenceError>;
}

/**
 * Context tag for the EmployeeServicePort service.
 */
export const EmployeeServicePort = Context.GenericTag<EmployeeServicePort>(
  "@repo/salon-domain/EmployeeServicePort",
);
