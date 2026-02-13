import { Data } from "effect";

/**
 * Raised when a section operation targets a section that does not exist.
 */
export class SectionNotFoundError extends Data.TaggedError(
  "SectionNotFoundError",
)<{ sectionId?: string; websiteId?: string }> {}

/**
 * Raised when an invalid section type is provided.
 */
export class InvalidSectionTypeError extends Data.TaggedError(
  "InvalidSectionTypeError",
)<{ sectionType: string }> {}

/**
 * Raised when a section operation fails.
 */
export class SectionError extends Data.TaggedError("SectionError")<{
  websiteId?: string;
  sectionType?: string;
  sectionId?: string;
  message: string;
}> {}
