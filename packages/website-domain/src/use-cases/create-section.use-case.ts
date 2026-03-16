import { Effect, Option } from "effect";
import type {
  SectionType,
  AllSections,
} from "../application/section/section.aggregate";
import { SectionAggregate } from "../application/section/section.aggregate";
import {
  SectionError,
  SectionNotFoundError,
  InvalidSectionTypeError,
} from "../application/section/errors";
import { WebsitePort } from "../ports/website.port";
import { MakeWebsiteId } from "../ports/section.port";

// --- Command DTO ---

export interface CreateSectionCommand {
  websiteId: string;
  type: SectionType;
  position: number;
}

// --- Result DTO ---

export type CreateSectionResult = AllSections;

// --- Use Case ---

const make = Effect.gen(function* () {
  const aggregate = yield* SectionAggregate;
  const websitePort = yield* WebsitePort;

  return {
    execute: (
      command: CreateSectionCommand,
    ): Effect.Effect<
      CreateSectionResult,
      InvalidSectionTypeError | SectionError | SectionNotFoundError
    > =>
      Effect.gen(function* () {
        const websiteOption = yield* websitePort
          .getWebsiteById(command.websiteId)
          .pipe(
            Effect.mapError(
              (error) =>
                new SectionError({
                  websiteId: command.websiteId,
                  message: `Failed to verify website existence: ${error.message}`,
                }),
            ),
          );

        if (Option.isNone(websiteOption)) {
          return yield* Effect.fail(
            new SectionNotFoundError({ websiteId: command.websiteId }),
          );
        }

        return yield* aggregate.createSection(
          MakeWebsiteId(command.websiteId),
          command.type,
          command.position,
        );
      }),
  };
});

export class CreateSectionUseCase extends Effect.Service<CreateSectionUseCase>()(
  "@repo/website-domain/CreateSectionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SectionAggregate.Default],
  },
) {}
