import { Effect } from "effect";
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

const make = Effect.gen(function* () {
  const aggregate = yield* SectionAggregate;
  const mediaPort = yield* MediaPort;

  const validateMediaReferences = (
    mediaIds: string[],
  ): Effect.Effect<void, SectionValidationError> =>
    Effect.gen(function* () {
      const allMediaExist = yield* mediaPort.mediaIdsExist(mediaIds).pipe(
        Effect.mapError(
          (error) =>
            new SectionValidationError({
              message: `Failed to validate media references: ${error.message}`,
            }),
        ),
      );

      if (!allMediaExist) {
        return yield* Effect.fail(
          new SectionValidationError({
            message: `One or more media files not found for IDs: ${mediaIds.join(
              ", ",
            )}`,
          }),
        );
      }
    });

  return {
    execute: (
      command: UpdateSectionCommand,
    ): Effect.Effect<
      void,
      | InvalidSectionTypeError
      | SectionError
      | SectionNotFoundError
      | SectionValidationError
    > =>
      Effect.gen(function* () {
        const mediaIds = extractMediaIds(command);
        if (mediaIds.length > 0) {
          yield* validateMediaReferences(mediaIds);
        }

        yield* aggregate.updateSection(command);
      }),
  };
});

export class UpdateSectionUseCase extends Effect.Service<UpdateSectionUseCase>()(
  "@repo/website-database/UpdateSectionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SectionAggregate.Default],
  },
) {}
