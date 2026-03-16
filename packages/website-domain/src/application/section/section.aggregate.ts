import { Effect, Layer } from "effect";
import {
  SectionPort,
  type PortSectionType,
  type PortAllSections,
  type PortSection,
  type PortReasonItem,
  SectionPersistenceError,
} from "../../ports/section.port";
import {
  SectionError,
  InvalidSectionTypeError,
  SectionValidationError,
} from "./errors";
import { PostgresSectionAdapter } from "../../adapters/section/postgres-section.adapter";
import { PostgresTextWithImageSectionAdapter } from "../../adapters/section/postgres-text-with-image-section.adapter";
import { PostgresCenterTextSectionAdapter } from "../../adapters/section/postgres-center-text-section.adapter";
import { PostgresGallerySectionAdapter } from "../../adapters/section/postgres-gallery-section.adapter";
import { PostgresReasonSectionAdapter } from "../../adapters/section/postgres-reason-section.adapter";
import { PostgresStylistsSectionAdapter } from "../../adapters/section/postgres-stylists-section.adapter";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";

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

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const sectionPort = yield* SectionPort;

  // Fetches all sections for the website, validates that index >= 0, and clamps
  // it to the valid range. Set forInsert=true when the index represents an
  // insertion point (max = length); leave false for reorder (max = length - 1).
  const validateAndClampIndex = (
    websiteId: string,
    index: number,
    forInsert = false,
  ): Effect.Effect<number, SectionError | SectionPersistenceError> =>
    Effect.gen(function* () {
      if (index < 0) {
        return yield* Effect.fail(
          new SectionError({
            websiteId,
            message: "Index must be zero or greater",
          }),
        );
      }

      const maximumIndex = yield* sectionPort
        .fetchSectionsByWebsiteId(websiteId)
        .pipe(
          Effect.map((sections) => sections.length),
          Effect.map((count) => count - (forInsert ? 0 : 1)),
        );

      if (maximumIndex < 0) {
        return yield* Effect.fail(
          new SectionError({
            websiteId,
            message: "Cannot reorder sections for an empty website",
          }),
        );
      }

      return Math.min(index, maximumIndex);
    });

  const createSection = (
    websiteId: string,
    type: SectionType,
    position: number,
  ) =>
    Effect.gen(function* () {
      if (!VALID_SECTION_TYPES.has(type)) {
        return yield* Effect.fail(
          new InvalidSectionTypeError({ sectionType: type }),
        );
      }

      const clampedPosition = yield* validateAndClampIndex(
        websiteId,
        position,
        true,
      );

      const portSection = yield* sectionPort.createSection(
        websiteId,
        type,
        clampedPosition,
      );

      return fromPort(portSection);
    }).pipe(
      Effect.catchTag("SectionPersistenceError", (error) =>
        Effect.fail(
          new SectionError({
            websiteId,
            sectionType: type,
            message: error.message,
          }),
        ),
      ),
    );

  const updateSection = (section: AllSections) =>
    Effect.gen(function* () {
      if (!VALID_SECTION_TYPES.has(section.type)) {
        return yield* Effect.fail(
          new InvalidSectionTypeError({ sectionType: section.type }),
        );
      }

      yield* sectionPort.updateSection(toPort(section));

      yield* Effect.log("Section updated", section.id);
    }).pipe(
      Effect.catchTag("SectionPersistenceError", (error) =>
        Effect.fail(
          error.isValidation
            ? new SectionValidationError({ message: error.message })
            : new SectionError({
                sectionId: section.id,
                sectionType: section.type,
                message: error.message,
              }),
        ),
      ),
    );

  const deleteSection = (websiteId: string, sectionId: string) =>
    Effect.gen(function* () {
      yield* sectionPort.deleteSection(websiteId, sectionId);

      yield* Effect.log("Section deleted", sectionId);
    }).pipe(
      Effect.catchTag("SectionPersistenceError", (error) =>
        Effect.fail(
          new SectionError({
            sectionId,
            websiteId,
            message: error.message,
          }),
        ),
      ),
    );

  const reorderSections = (
    websiteId: string,
    sectionId: string,
    newIndex: number,
  ) =>
    Effect.gen(function* () {
      yield* sectionPort.sectionExists(sectionId, websiteId).pipe(
        Effect.flatMap((exists) => {
          if (!exists) {
            return Effect.fail(
              new SectionError({
                sectionId,
                websiteId,
                message: "Section does not exist in the specified website",
              }),
            );
          }
          return Effect.succeed(true);
        }),
      );

      const clampedIndex = yield* validateAndClampIndex(websiteId, newIndex);

      yield* sectionPort.reorderSections(websiteId, sectionId, clampedIndex);

      yield* Effect.log("Sections reordered for website", websiteId);
    }).pipe(
      Effect.catchTag("SectionPersistenceError", (error) =>
        Effect.fail(
          new SectionError({
            sectionId,
            websiteId,
            message: error.message,
          }),
        ),
      ),
    );

  const fetchSections = (websiteId: string) =>
    Effect.gen(function* () {
      const portSections =
        yield* sectionPort.fetchSectionsByWebsiteId(websiteId);

      return portSections.map(fromPort);
    }).pipe(
      Effect.catchTag("SectionPersistenceError", (error) =>
        Effect.fail(
          new SectionError({
            websiteId,
            message: error.message,
          }),
        ),
      ),
    );

  return {
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    fetchSections,
  };
});

export class SectionAggregate extends Effect.Service<SectionAggregate>()(
  "@repo/website-domain/SectionAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresSectionAdapter.pipe(
        Layer.provide(
          Layer.mergeAll(
            PostgresGallerySectionAdapter,
            PostgresTextWithImageSectionAdapter,
            PostgresCenterTextSectionAdapter,
            PostgresReasonSectionAdapter,
            PostgresStylistsSectionAdapter,
          ),
        ),
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
