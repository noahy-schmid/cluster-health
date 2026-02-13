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
 * Raised when a section create operation fails.
 */
export class SectionCreateError extends Data.TaggedError(
  "SectionCreateError",
)<{ websiteId: string; sectionType: string; message?: string }> {}

/**
 * Raised when a section update operation fails.
 */
export class SectionUpdateError extends Data.TaggedError(
  "SectionUpdateError",
)<{ sectionId: string; message?: string }> {}

/**
 * Raised when a section delete operation fails.
 */
export class SectionDeleteError extends Data.TaggedError(
  "SectionDeleteError",
)<{ sectionId: string; websiteId: string; message?: string }> {}

/**
 * Raised when a section fetch operation fails.
 */
export class SectionFetchError extends Data.TaggedError(
  "SectionFetchError",
)<{ websiteId?: string; sectionId?: string; message?: string }> {}

/**
 * Raised when a section reorder operation fails.
 */
export class SectionReorderError extends Data.TaggedError(
  "SectionReorderError",
)<{ websiteId: string; message?: string }> {}
