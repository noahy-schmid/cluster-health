import { Effect } from "effect";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";

// --- Command DTO ---

export interface ReorderSectionsCommand {
  websiteId: string;
  sectionIds: string[];
}

// --- Use Case ---

const make = Effect.gen(function* () {
  const aggregate = yield* SectionAggregate;

  return {
    execute: (
      command: ReorderSectionsCommand,
    ): Effect.Effect<void, SectionError> =>
      aggregate.reorderSections(command.websiteId, command.sectionIds),
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
