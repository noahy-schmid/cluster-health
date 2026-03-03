import { Data } from "effect";

/**
 * Raised when an employee-service assignment operation fails.
 */
export class EmployeeServiceError extends Data.TaggedError(
  "EmployeeServiceError",
)<{
  stylistId?: string;
  serviceId?: string;
  message: string;
}> {}

/**
 * Raised when an employee-service assignment already exists.
 */
export class EmployeeServiceAlreadyAssignedError extends Data.TaggedError(
  "EmployeeServiceAlreadyAssignedError",
)<{
  stylistId: string;
  serviceId: string;
}> {}

/**
 * Raised when an employee-service assignment is not found.
 */
export class EmployeeServiceNotFoundError extends Data.TaggedError(
  "EmployeeServiceNotFoundError",
)<{
  stylistId: string;
  serviceId: string;
}> {}
