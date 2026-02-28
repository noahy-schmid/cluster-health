import { Context, Effect, Layer } from "effect";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";

// --- Command DTO ---

export interface DeleteSectionCommand {
  websiteId: string;
  sectionId: string;
}

// --- Use Case ---

export interface DeleteSectionUseCase {
  execute(command: DeleteSectionCommand): Effect.Effect<void, SectionError>;
}

export const DeleteSectionUseCase = Context.GenericTag<DeleteSectionUseCase>(
  "@repo/website-database/DeleteSectionUseCase",
);

export const DeleteSectionUseCaseLive = Layer.effect(
  DeleteSectionUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SectionAggregate;

    return {
      execute: (command: DeleteSectionCommand) =>
        aggregate.deleteSection(command.websiteId, command.sectionId),
    } satisfies DeleteSectionUseCase;
  }),
);
