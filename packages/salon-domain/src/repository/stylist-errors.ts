import { Data } from "effect";

/**
 * Raised when a stylist is not found in the database.
 */
export class StylistNotFoundError extends Data.TaggedError(
  "StylistNotFoundError",
)<{ stylistId?: string }> {}

/**
 * Raised when a database operation fails unexpectedly.
 */
export class StylistDatabaseError extends Data.TaggedError(
  "StylistDatabaseError",
)<{ message: string; cause?: unknown }> {}

export class StylistValidationError extends Data.TaggedError(
  "StylistValidationError",
)<{ message: string }> {}
