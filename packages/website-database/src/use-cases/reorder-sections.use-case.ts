import { Context, Effect, Layer } from "effect";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";

// --- Command DTO ---

export interface ReorderSectionsCommand {
  websiteId: string;
  sectionIds: string[];
}

// --- Use Case ---

export interface ReorderSectionsUseCase {
  execute(command: ReorderSectionsCommand): Effect.Effect<void, SectionError>;
}

export const ReorderSectionsUseCase =
  Context.GenericTag<ReorderSectionsUseCase>(
    "@repo/website-database/ReorderSectionsUseCase",
  );

export const ReorderSectionsUseCaseLive = Layer.effect(
  ReorderSectionsUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SectionAggregate;

    return {
      execute: (command: ReorderSectionsCommand) =>
        aggregate.reorderSections(command.websiteId, command.sectionIds),
    } satisfies ReorderSectionsUseCase;
  }),
);
