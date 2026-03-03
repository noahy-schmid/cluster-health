import { Data } from "effect";

/**
 * Raised when a resource operation fails.
 */
export class ResourceError extends Data.TaggedError("ResourceError")<{
  resourceId?: string;
  salonId?: string;
  message: string;
}> {}

/**
 * Raised when a resource is not found.
 */
export class ResourceNotFoundError extends Data.TaggedError(
  "ResourceNotFoundError",
)<{ resourceId: string }> {}

/**
 * Raised when a resource fails validation.
 */
export class ResourceValidationError extends Data.TaggedError(
  "ResourceValidationError",
)<{ message: string }> {}

/**
 * Raised when a resource cannot be deleted because it is still referenced.
 */
export class ResourceInUseError extends Data.TaggedError("ResourceInUseError")<{
  resourceType: string;
  message: string;
}> {}
