import { Context, Effect, Layer } from "effect";
import type { AllSections } from "../application/section/section.aggregate";
import {
  SectionAggregate,
  extractMediaIds,
} from "../application/section/section.aggregate";
import {
  SectionError,
  SectionNotFoundError,
  SectionValidationError,
  InvalidSectionTypeError,
} from "../application/section/errors";
import { MediaPort } from "../ports/media.port";

// --- Command DTO ---

export type UpdateSectionCommand = AllSections;

// --- Use Case ---

export interface UpdateSectionUseCase {
  execute(
    command: UpdateSectionCommand,
  ): Effect.Effect<
    void,
    | InvalidSectionTypeError
    | SectionError
    | SectionNotFoundError
    | SectionValidationError
  >;
}

export const UpdateSectionUseCase = Context.GenericTag<UpdateSectionUseCase>(
  "@repo/website-database/UpdateSectionUseCase",
);

export const UpdateSectionUseCaseLive = Layer.effect(
  UpdateSectionUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SectionAggregate;
    const mediaPort = yield* MediaPort;

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

    return {
      execute: (command: UpdateSectionCommand) =>
        Effect.gen(function* () {
          const mediaIds = extractMediaIds(command);
          if (mediaIds.length > 0) {
            yield* validateMediaReferences(mediaIds);
          }

          yield* aggregate.updateSection(command);
        }),
    } satisfies UpdateSectionUseCase;
  }),
);
