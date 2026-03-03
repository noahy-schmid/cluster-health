import { Data } from "effect";

/**
 * Raised when a service definition operation fails.
 */
export class ServiceError extends Data.TaggedError("ServiceError")<{
  serviceId?: string;
  salonId?: string;
  message: string;
}> {}

/**
 * Raised when a service definition is not found.
 */
export class ServiceNotFoundError extends Data.TaggedError(
  "ServiceNotFoundError",
)<{ serviceId: string }> {}

/**
 * Raised when a service definition fails validation.
 */
export class ServiceValidationError extends Data.TaggedError(
  "ServiceValidationError",
)<{ message: string }> {}
