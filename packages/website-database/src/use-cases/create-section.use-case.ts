import { Context, Effect, Layer, Option } from "effect";
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

// --- Command DTO ---

export interface CreateSectionCommand {
  websiteId: string;
  type: SectionType;
  position: number;
}

// --- Result DTO ---

export type CreateSectionResult = AllSections;

// --- Use Case ---

export interface CreateSectionUseCase {
  execute(
    command: CreateSectionCommand,
  ): Effect.Effect<
    CreateSectionResult,
    InvalidSectionTypeError | SectionError | SectionNotFoundError
  >;
}

export const CreateSectionUseCase = Context.GenericTag<CreateSectionUseCase>(
  "@repo/website-database/CreateSectionUseCase",
);

export const CreateSectionUseCaseLive = Layer.effect(
  CreateSectionUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SectionAggregate;
    const websitePort = yield* WebsitePort;

    return {
      execute: (command: CreateSectionCommand) =>
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
            command.websiteId,
            command.type,
            command.position,
          );
        }),
    } satisfies CreateSectionUseCase;
  }),
);
