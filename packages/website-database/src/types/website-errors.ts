import { Data } from "effect";

/**
 * Raised when a website is not found in the database.
 */
export class WebsiteNotFoundError extends Data.TaggedError(
  "WebsiteNotFoundError",
)<{ websiteId?: string; salonId?: string }> {}

/**
 * Raised when a database operation fails unexpectedly.
 */
export class WebsiteDatabaseError extends Data.TaggedError(
  "WebsiteDatabaseError",
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
)<{ message: string; cause?: any }> {}

/**
 * Raised when website input validation fails.
 */
export class WebsiteValidationError extends Data.TaggedError(
  "WebsiteValidationError",
)<{ message: string }> {}

/**
 * Raised when attempting to create a website for a salon that already has one or when a slug is already taken.
 */
export class WebsiteAlreadyExistsError extends Data.TaggedError(
  "WebsiteAlreadyExistsError",
)<{ salonId?: string; slug?: string }> {}
