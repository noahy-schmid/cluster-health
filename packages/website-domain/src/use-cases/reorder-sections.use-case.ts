import { Effect } from "effect";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";
import { MakeWebsiteId, MakeSectionId } from "../ports/section.port";

// --- Command DTO ---

export interface ReorderSectionsCommand {
  websiteId: string;
  sectionId: string;
  newIndex: number;
}

// --- Use Case ---

const make = Effect.gen(function* () {
  const aggregate = yield* SectionAggregate;

  return {
    execute: (
      command: ReorderSectionsCommand,
    ): Effect.Effect<void, SectionError> =>
      aggregate.reorderSections(
        MakeWebsiteId(command.websiteId),
        MakeSectionId(command.sectionId),
        command.newIndex,
      ),
  };
});

export class ReorderSectionsUseCase extends Effect.Service<ReorderSectionsUseCase>()(
  "@repo/website-domain/ReorderSectionsUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SectionAggregate.Default],
  },
) {}
