import { Effect } from "effect";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";
import { MakeSectionId, MakeWebsiteId } from "../ports/section.port";

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
      aggregate.deleteSection(
        MakeWebsiteId(command.websiteId),
        MakeSectionId(command.sectionId),
      ),
  };
});

export class DeleteSectionUseCase extends Effect.Service<DeleteSectionUseCase>()(
  "@repo/website-domain/DeleteSectionUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SectionAggregate.Default],
  },
) {}
