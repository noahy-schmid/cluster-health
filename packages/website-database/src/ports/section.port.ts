import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when a section persistence operation fails at the database level.
 * When `isValidation` is true, the error represents a business rule violation
 * detected in the adapter (e.g. invalid item count).
 */
export class SectionPersistenceError extends Data.TaggedError(
  "SectionPersistenceError",
)<{
  message: string;
  cause?: unknown;
  isValidation?: boolean;
}> {}

// --- Port-owned types ---

export type PortSectionType =
  | "text-with-image"
  | "gallery"
  | "center-text"
  | "reason"
  | "stylists-section";

export interface PortTextWithImageSettings {
  imageId: string;
  title: string;
  text: string;
}

export interface PortGallerySettings {
  title: string;
  subtitle: string;
  imageIds: string[];
}

export interface PortCenterTextSettings {
  title: string;
  content: string;
}

export interface PortReasonItem {
  title: string;
  description: string;
  imageId?: string;
}

export interface PortReasonSettings {
  title: string;
  subtitle: string;
  items: PortReasonItem[];
}

export interface PortStylistsSettings {
  title: string;
  subtitle: string;
}

type PortTypeToSettings = {
  "text-with-image": PortTextWithImageSettings;
  gallery: PortGallerySettings;
  "center-text": PortCenterTextSettings;
  reason: PortReasonSettings;
  "stylists-section": PortStylistsSettings;
};

export type PortSection<T extends PortSectionType> = {
  id: string;
  order: number;
  menuTitle: string | null;
  type: T;
  settings: PortTypeToSettings[T];
};

export type PortAllSections = {
  [K in PortSectionType]: PortSection<K>;
}[PortSectionType];

// --- Port interface ---

/**
 * Port for section persistence operations.
 * Abstracts database access for sections of all types.
 */
export interface SectionPort {
  /**
   * Creates a new section with default settings for the given type.
   * @param websiteId Website ID the section belongs to.
   * @param type Section type to create.
   * @param position Order/position of the section.
   * @returns Effect resolving to the created section data.
   */
  createSection(
    websiteId: string,
    type: PortSectionType,
    position: number,
  ): Effect.Effect<PortAllSections, SectionPersistenceError>;

  /**
   * Updates an existing section and its type-specific settings.
   * @param section Full section data including updated settings.
   * @returns Effect resolving when update completes.
   */
  updateSection(
    section: PortAllSections,
  ): Effect.Effect<void, SectionPersistenceError>;

  /**
   * Deletes a section by ID, scoped to a website.
   * @param websiteId Website ID owning the section.
   * @param sectionId Section ID to delete.
   * @returns Effect resolving when deletion completes.
   */
  deleteSection(
    websiteId: string,
    sectionId: string,
  ): Effect.Effect<void, SectionPersistenceError>;

  /**
   * Reorders sections for a website by setting new order values.
   * @param websiteId Website ID owning the sections.
   * @param sectionIds Array of section IDs in desired order.
   * @returns Effect resolving when reorder completes.
   */
  reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Effect.Effect<void, SectionPersistenceError>;

  /**
   * Fetches all sections for a website, ordered by position.
   * @param websiteId Website ID to fetch sections for.
   * @returns Effect resolving to array of all sections.
   */
  fetchSectionsByWebsiteId(
    websiteId: string,
  ): Effect.Effect<PortAllSections[], SectionPersistenceError>;
}

/**
 * Context tag for the SectionPort service.
 */
export const SectionPort = Context.GenericTag<SectionPort>(
  "@repo/website-database/SectionPort",
);
