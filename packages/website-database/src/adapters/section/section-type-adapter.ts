import { Context, Effect } from "effect";
import {
  SectionPersistenceError,
  type PortSectionType,
  type PortSection,
} from "../../ports/section.port";

/**
 * Port interface for a section-type-specific adapter.
 * Each section type (gallery, text-with-image, etc.) provides its own adapter.
 */
export interface SectionTypeAdapter<T extends PortSectionType> {
  /**
   * Creates type-specific data with defaults for a new section.
   */
  createTypeData(
    sectionId: string,
  ): Effect.Effect<PortSection<T>["settings"], SectionPersistenceError>;

  /**
   * Updates type-specific data for an existing section.
   */
  updateTypeData(
    sectionId: string,
    settings: PortSection<T>["settings"],
  ): Effect.Effect<void, SectionPersistenceError>;

  /**
   * Fetches type-specific data for a section.
   */
  fetchTypeData(
    sectionId: string,
  ): Effect.Effect<
    PortSection<T>["settings"] | undefined,
    SectionPersistenceError
  >;

  /**
   * Validates type-specific invariants for the given settings.
   * Returns void on success, fails with SectionPersistenceError if invalid.
   */
  validateSettings(
    settings: PortSection<T>["settings"],
  ): Effect.Effect<void, SectionPersistenceError>;
}

// --- Context tags for each section type adapter ---

export const GallerySectionAdapter = Context.GenericTag<
  SectionTypeAdapter<"gallery">
>("@repo/website-database/GallerySectionAdapter");

export const TextWithImageSectionAdapter = Context.GenericTag<
  SectionTypeAdapter<"text-with-image">
>("@repo/website-database/TextWithImageSectionAdapter");

export const CenterTextSectionAdapter = Context.GenericTag<
  SectionTypeAdapter<"center-text">
>("@repo/website-database/CenterTextSectionAdapter");

export const ReasonSectionAdapter = Context.GenericTag<
  SectionTypeAdapter<"reason">
>("@repo/website-database/ReasonSectionAdapter");

export const StylistsSectionAdapter = Context.GenericTag<
  SectionTypeAdapter<"stylists-section">
>("@repo/website-database/StylistsSectionAdapter");
