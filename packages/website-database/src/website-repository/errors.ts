import { Data } from "effect";

/**
 * Raised when a hero update targets a website that does not exist.
 */
export class WebsiteHeroNotFoundError extends Data.TaggedError(
  "WebsiteHeroNotFoundError",
)<{ websiteId?: string }> {}

/**
 * Raised when the stored hero text color is invalid.
 */
export class WebsiteHeroInvalidTextColorError extends Data.TaggedError(
  "WebsiteHeroInvalidTextColorError",
)<{ websiteId?: string; textColor: string }> {}
