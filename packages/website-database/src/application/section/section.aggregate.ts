import { Context, Data, Effect, Layer } from "effect";
import {
  SectionPort,
  type PortSectionType,
  type PortAllSections,
  type PortSection,
  type PortReasonItem,
} from "../../ports/section.port";

// --- Domain types (derived from port types) ---

export type SectionType = PortSectionType;

export type TextWithImageSettings = PortSection<"text-with-image">["settings"];
export type GallerySettings = PortSection<"gallery">["settings"];
export type CenterTextSettings = PortSection<"center-text">["settings"];
export type ReasonSettings = PortSection<"reason">["settings"];
export type ReasonItem = PortReasonItem;
export type StylistsSettings = PortSection<"stylists-section">["settings"];

type TypeToSettings = {
  "text-with-image": TextWithImageSettings;
  gallery: GallerySettings;
  "center-text": CenterTextSettings;
  reason: ReasonSettings;
  "stylists-section": StylistsSettings;
};

export type Section<T extends SectionType> = {
  id: string;
  order: number;
  menuTitle: string | undefined;
  type: T;
  settings: TypeToSettings[T];
};

export type AllSections = { [K in SectionType]: Section<K> }[SectionType];

// --- Domain errors ---

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

// --- Mapping between port and domain ---

const VALID_SECTION_TYPES: ReadonlySet<string> = new Set<SectionType>([
  "text-with-image",
  "gallery",
  "center-text",
  "reason",
  "stylists-section",
]);

const fromPort = (portSection: PortAllSections): AllSections =>
  ({
    ...portSection,
    menuTitle: portSection.menuTitle ?? undefined,
  }) as AllSections;

const toPort = (section: AllSections): PortAllSections =>
  ({
    ...section,
    menuTitle: section.menuTitle ?? null,
  }) as PortAllSections;

// --- Business validation ---

const validateReasonItems = (
  items: ReasonItem[],
): Effect.Effect<void, SectionValidationError> =>
  Effect.gen(function* () {
    if (items.length < 2 || items.length > 4) {
      return yield* Effect.fail(
        new SectionValidationError({
          message: "Reason section must have 2-4 items",
        }),
      );
    }

    const itemsWithImages = items.filter(
      (item) => item.imageId && item.imageId.trim() !== "",
    );
    if (itemsWithImages.length > 0 && itemsWithImages.length !== items.length) {
      return yield* Effect.fail(
        new SectionValidationError({
          message:
            "Either all reasons must have images or none should have images",
        }),
      );
    }
  });

const validateSectionSettings = (
  section: AllSections,
): Effect.Effect<void, SectionValidationError> =>
  Effect.gen(function* () {
    if (section.type === "reason") {
      yield* validateReasonItems(section.settings.items);
    }
  });

/**
 * Extracts all media IDs referenced by a section's settings.
 */
export const extractMediaIds = (section: AllSections): string[] => {
  switch (section.type) {
    case "text-with-image":
      return section.settings.imageId ? [section.settings.imageId] : [];
    case "gallery":
      return section.settings.imageIds.filter((id) => id.trim() !== "");
    case "reason":
      return section.settings.items
        .map((item) => item.imageId)
        .filter((id): id is string => !!id && id.trim() !== "");
    case "center-text":
    case "stylists-section":
      return [];
  }
};

// --- Aggregate interface ---

/**
 * Section aggregate encapsulates business logic for website sections.
 */
export interface SectionAggregate {
  /**
   * Creates a new section with default settings.
   */
  createSection(
    websiteId: string,
    type: SectionType,
    position: number,
  ): Effect.Effect<AllSections, InvalidSectionTypeError | SectionError>;

  /**
   * Updates an existing section after validating business rules.
   */
  updateSection(
    section: AllSections,
  ): Effect.Effect<
    void,
    InvalidSectionTypeError | SectionValidationError | SectionError
  >;

  /**
   * Deletes a section.
   */
  deleteSection(
    websiteId: string,
    sectionId: string,
  ): Effect.Effect<void, SectionError>;

  /**
   * Reorders sections for a website, validating the provided IDs.
   */
  reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Effect.Effect<void, SectionError>;

  /**
   * Fetches all sections for a website.
   */
  fetchSections(websiteId: string): Effect.Effect<AllSections[], SectionError>;
}

/**
 * Context tag for the SectionAggregate service.
 */
export const SectionAggregate = Context.GenericTag<SectionAggregate>(
  "@repo/website-database/SectionAggregate",
);

// --- Aggregate implementation ---

const make = Effect.gen(function* () {
  const sectionPort = yield* SectionPort;

  const createSection: SectionAggregate["createSection"] = (
    websiteId,
    type,
    position,
  ) =>
    Effect.gen(function* () {
      if (!VALID_SECTION_TYPES.has(type)) {
        return yield* Effect.fail(
          new InvalidSectionTypeError({ sectionType: type }),
        );
      }

      const portSection = yield* sectionPort
        .createSection(websiteId, type, position)
        .pipe(
          Effect.mapError(
            (error) =>
              new SectionError({
                websiteId,
                sectionType: type,
                message: error.message,
              }),
          ),
        );

      return fromPort(portSection);
    });

  const updateSection: SectionAggregate["updateSection"] = (section) =>
    Effect.gen(function* () {
      if (!VALID_SECTION_TYPES.has(section.type)) {
        return yield* Effect.fail(
          new InvalidSectionTypeError({ sectionType: section.type }),
        );
      }

      yield* validateSectionSettings(section);

      yield* sectionPort.updateSection(toPort(section)).pipe(
        Effect.mapError(
          (error) =>
            new SectionError({
              sectionId: section.id,
              sectionType: section.type,
              message: error.message,
            }),
        ),
      );

      yield* Effect.log("Section updated", section.id);
    });

  const deleteSection: SectionAggregate["deleteSection"] = (
    websiteId,
    sectionId,
  ) =>
    Effect.gen(function* () {
      yield* sectionPort.deleteSection(websiteId, sectionId).pipe(
        Effect.mapError(
          (error) =>
            new SectionError({
              sectionId,
              websiteId,
              message: error.message,
            }),
        ),
      );

      yield* Effect.log("Section deleted", sectionId);
    });

  const reorderSections: SectionAggregate["reorderSections"] = (
    websiteId,
    sectionIds,
  ) =>
    Effect.gen(function* () {
      // Validate that provided IDs match existing sections
      const existingSections = yield* sectionPort
        .fetchSectionsByWebsiteId(websiteId)
        .pipe(
          Effect.mapError(
            (error) =>
              new SectionError({
                websiteId,
                message: error.message,
              }),
          ),
        );

      if (sectionIds.length !== existingSections.length) {
        return yield* Effect.fail(
          new SectionError({
            websiteId,
            message: `Provided sectionIds length (${sectionIds.length}) does not match number of sections in website (${existingSections.length})`,
          }),
        );
      }

      const existingIdSet = new Set(existingSections.map((s) => s.id));
      if (!sectionIds.every((id) => existingIdSet.has(id))) {
        return yield* Effect.fail(
          new SectionError({
            websiteId,
            message: "Provided sectionIds do not match sections in website",
          }),
        );
      }

      yield* sectionPort.reorderSections(websiteId, sectionIds).pipe(
        Effect.mapError(
          (error) =>
            new SectionError({
              websiteId,
              message: error.message,
            }),
        ),
      );

      yield* Effect.log("Sections reordered for website", websiteId);
    });

  const fetchSections: SectionAggregate["fetchSections"] = (websiteId) =>
    Effect.gen(function* () {
      const portSections = yield* sectionPort
        .fetchSectionsByWebsiteId(websiteId)
        .pipe(
          Effect.mapError(
            (error) =>
              new SectionError({
                websiteId,
                message: error.message,
              }),
          ),
        );

      return portSections.map(fromPort);
    });

  return {
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    fetchSections,
  } satisfies SectionAggregate;
});

/**
 * Live layer for the SectionAggregate service.
 * Depends on SectionPort.
 */
export const SectionAggregateLive = Layer.effect(SectionAggregate, make);
