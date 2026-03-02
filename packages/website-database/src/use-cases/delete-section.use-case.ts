import { Effect } from "effect";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";

// --- Command DTO ---

export interface DeleteSectionCommand {
  websiteId: string;
  sectionId: string;
}

// --- Use Case ---

const make = Effect.gen(function* () {
  const aggregate = yield* SectionAggregate;

  return {
    execute: (
      command: DeleteSectionCommand,
    ): Effect.Effect<void, SectionError> =>
      aggregate.deleteSection(command.websiteId, command.sectionId),
  };
});

export class DeleteSectionUseCase extends Effect.Service<DeleteSectionUseCase>()(
  "@repo/website-database/DeleteSectionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SectionAggregate.Default],
  },
) {}
