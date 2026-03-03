import { Data } from "effect";

/**
 * Raised when section settings fail business validation.
 */
export class SectionValidationError extends Data.TaggedError(
  "SectionValidationError",
)<{ message: string }> {}

/**
 * Raised when an invalid section type is provided.
 */
export class InvalidSectionTypeError extends Data.TaggedError(
  "InvalidSectionTypeError",
)<{ sectionType: string }> {}

/**
 * Raised when a section is not found.
 */
export class SectionNotFoundError extends Data.TaggedError(
  "SectionNotFoundError",
)<{ sectionId?: string; websiteId?: string }> {}

/**
 * Raised when a section operation fails.
 */
export class SectionError extends Data.TaggedError("SectionError")<{
  websiteId?: string;
  sectionType?: string;
  sectionId?: string;
  message: string;
}> {}
