import { Effect, Layer, Option } from "effect";
import { SectionUseCase } from "./section.interface";
import {
  SectionAggregate,
  SectionError,
  SectionNotFoundError,
  SectionValidationError,
  extractMediaIds,
} from "../application/section/section.aggregate";
import { WebsitePort } from "../ports/website.port";
import { MediaPort } from "../ports/media.port";

/**
 * Implementation of the SectionUseCase.
 * Orchestrates cross-domain validation (website/media existence)
 * and delegates business logic to the SectionAggregate.
 */
const make = Effect.gen(function* () {
  const sectionAggregate = yield* SectionAggregate;
  const websitePort = yield* WebsitePort;
  const mediaPort = yield* MediaPort;

  /**
   * Validates that a website exists by its ID.
   */
  const validateWebsiteExists = (websiteId: string) =>
    Effect.gen(function* () {
      const websiteOption = yield* websitePort.getWebsiteById(websiteId).pipe(
        Effect.mapError(
          (error) =>
            new SectionError({
              websiteId,
              message: `Failed to verify website existence: ${error.message}`,
            }),
        ),
      );

      if (Option.isNone(websiteOption)) {
        return yield* Effect.fail(new SectionNotFoundError({ websiteId }));
      }
    });

  /**
   * Validates that all referenced media IDs exist.
   */
  const validateMediaReferences = (
    mediaIds: string[],
  ): Effect.Effect<void, SectionValidationError> =>
    Effect.gen(function* () {
      for (const mediaId of mediaIds) {
        const mediaFile = yield* mediaPort.findMediaFileById(mediaId).pipe(
          Effect.mapError(
            () =>
              new SectionValidationError({
                message: `Failed to verify media file: ${mediaId}`,
              }),
          ),
        );

        if (!mediaFile) {
          return yield* Effect.fail(
            new SectionValidationError({
              message: `Media file not found: ${mediaId}`,
            }),
          );
        }
      }
    });

  const createSection: SectionUseCase["createSection"] = (
    websiteId,
    type,
    position,
  ) =>
    Effect.gen(function* () {
      yield* validateWebsiteExists(websiteId);
      return yield* sectionAggregate.createSection(websiteId, type, position);
    });

  const updateSection: SectionUseCase["updateSection"] = (section) =>
    Effect.gen(function* () {
      // Validate media references
      const mediaIds = extractMediaIds(section);
      if (mediaIds.length > 0) {
        yield* validateMediaReferences(mediaIds);
      }

      yield* sectionAggregate.updateSection(section);
    });

  const deleteSection: SectionUseCase["deleteSection"] = (
    websiteId,
    sectionId,
  ) => sectionAggregate.deleteSection(websiteId, sectionId);

  const reorderSections: SectionUseCase["reorderSections"] = (
    websiteId,
    sectionIds,
  ) => sectionAggregate.reorderSections(websiteId, sectionIds);

  const fetchSections: SectionUseCase["fetchSections"] = (websiteId) =>
    sectionAggregate.fetchSections(websiteId);

  return {
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    fetchSections,
  } satisfies SectionUseCase;
});

/**
 * Live layer for the SectionUseCase.
 * Depends on SectionAggregate, WebsitePort, and MediaPort.
 */
export const SectionUseCaseLive = Layer.effect(SectionUseCase, make);
