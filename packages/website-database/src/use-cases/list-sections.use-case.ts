import { Effect } from "effect";
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

const make = Effect.gen(function* () {
  const aggregate = yield* SectionAggregate;

  return {
    execute: (
      query: ListSectionsQuery,
    ): Effect.Effect<ListSectionsResult, SectionError> =>
      aggregate.fetchSections(query.websiteId),
  };
});

export class ListSectionsUseCase extends Effect.Service<ListSectionsUseCase>()(
  "@repo/website-database/ListSectionsUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SectionAggregate.Default],
  },
) {}
