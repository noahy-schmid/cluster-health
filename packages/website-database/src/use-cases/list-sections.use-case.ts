import { Context, Effect, Layer } from "effect";
import type { AllSections } from "../application/section/section.aggregate";
import { SectionAggregate } from "../application/section/section.aggregate";
import { SectionError } from "../application/section/errors";

// --- Query DTO ---

export interface ListSectionsQuery {
  websiteId: string;
}

// --- Result DTO ---

export type ListSectionsResult = AllSections[];

// --- Use Case ---

export interface ListSectionsUseCase {
  execute(
    query: ListSectionsQuery,
  ): Effect.Effect<ListSectionsResult, SectionError>;
}

export const ListSectionsUseCase = Context.GenericTag<ListSectionsUseCase>(
  "@repo/website-database/ListSectionsUseCase",
);

export const ListSectionsUseCaseLive = Layer.effect(
  ListSectionsUseCase,
  Effect.gen(function* () {
    const aggregate = yield* SectionAggregate;

    return {
      execute: (query: ListSectionsQuery) =>
        aggregate.fetchSections(query.websiteId),
    } satisfies ListSectionsUseCase;
  }),
);
