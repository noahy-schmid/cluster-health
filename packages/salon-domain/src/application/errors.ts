import { Data } from "effect";

/**
 * Base error for unexpected internal failures within the domain.
 */
export class InternalError extends Data.TaggedError("InternalError")<{
  message: string;
  cause?: unknown;
}> {}

/**
 * Base error when a requested entity is not found.
 */
export class NotFoundError extends Data.TaggedError("NotFoundError")<{
  entity: string;
  id: string;
}> {}

/**
 * Base error when an operation conflicts with existing state.
 */
export class ConflictError extends Data.TaggedError("ConflictError")<{
  message: string;
}> {}

/**
 * Base error when input fails business validation.
 */
export class ValidationError extends Data.TaggedError("ValidationError")<{
  message: string;
}> {}

/**
 * Base error for infrastructure/database operation failures.
 * Used across all ports and adapters instead of per-port error classes.
 */
export class InfrastructureError extends Data.TaggedError(
  "InfrastructureError",
)<{
  message: string;
  cause?: unknown;
}> {}

/**
 * Error when a required resource (identified by slug) does not exist in a salon.
 * Used by simplified service use cases that expect specific resources to be present.
 */
export class ResourceMissingError extends Data.TaggedError(
  "ResourceMissingError",
)<{
  salonId: string;
  resourceSlug: string;
}> {}
