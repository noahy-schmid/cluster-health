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
