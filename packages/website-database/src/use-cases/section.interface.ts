import { Context, Effect } from "effect";

// --- Exported types (derived from aggregate types, exposed beyond domain boundary) ---

export type {
  SectionType,
  AllSections,
  Section,
  TextWithImageSettings,
  GallerySettings,
  CenterTextSettings,
  ReasonSettings,
  ReasonItem,
  StylistsSettings,
} from "../application/section/section.aggregate";

export {
  SectionValidationError,
  InvalidSectionTypeError,
  SectionNotFoundError,
  SectionError,
} from "../application/section/section.aggregate";

export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; errors: E };

// --- UseCase types ---

import type {
  AllSections,
  SectionType,
  SectionError,
  InvalidSectionTypeError,
  SectionValidationError,
  SectionNotFoundError,
} from "../application/section/section.aggregate";

/**
 * Application service (use case) for managing website sections.
 * Validates cross-domain concerns (website/media existence) and delegates
 * business logic to the section aggregate.
 */
export interface SectionUseCase {
  /**
   * Creates a new section for a website.
   * Validates that the website exists before creating.
   * @param websiteId Website ID to create the section for.
   * @param type Section type to create.
   * @param position Position/order of the section.
   * @returns Effect resolving to the created section.
   */
  createSection(
    websiteId: string,
    type: SectionType,
    position: number,
  ): Effect.Effect<
    AllSections,
    InvalidSectionTypeError | SectionError | SectionNotFoundError
  >;

  /**
   * Updates an existing section.
   * Validates that referenced media IDs exist before updating.
   * @param section Section data to update.
   * @returns Effect resolving when update completes.
   */
  updateSection(
    section: AllSections,
  ): Effect.Effect<
    void,
    | InvalidSectionTypeError
    | SectionError
    | SectionNotFoundError
    | SectionValidationError
  >;

  /**
   * Deletes a section.
   * @param websiteId Website ID owning the section.
   * @param sectionId Section ID to delete.
   * @returns Effect resolving when deletion completes.
   */
  deleteSection(
    websiteId: string,
    sectionId: string,
  ): Effect.Effect<void, SectionError>;

  /**
   * Reorders sections for a website.
   * @param websiteId Website ID owning the sections.
   * @param sectionIds Array of section IDs in desired order.
   * @returns Effect resolving when reordering completes.
   */
  reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Effect.Effect<void, SectionError>;

  /**
   * Fetches all sections for a website.
   * @param websiteId Website ID to fetch sections for.
   * @returns Effect resolving to array of sections.
   */
  fetchSections(websiteId: string): Effect.Effect<AllSections[], SectionError>;
}

/**
 * Context tag for the SectionUseCase service.
 */
export const SectionUseCase = Context.GenericTag<SectionUseCase>(
  "@repo/website-database/SectionUseCase",
);
