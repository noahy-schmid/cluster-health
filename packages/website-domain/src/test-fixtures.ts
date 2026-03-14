import { Option } from "effect";
import type { CreateWebsiteInput } from "./types/website";
import type { CreateSectionCommand } from "./use-cases/create-section.use-case";
import type { DeleteSectionCommand } from "./use-cases/delete-section.use-case";
import type { ListSectionsQuery } from "./use-cases/list-sections.use-case";
import type { ReorderSectionsCommand } from "./use-cases/reorder-sections.use-case";

function createFixtureSuffix() {
  return crypto.randomUUID().slice(0, 8);
}

export function createWebsiteInput(
  overrides: Partial<CreateWebsiteInput> = {},
): CreateWebsiteInput {
  const suffix = createFixtureSuffix();

  return {
    salonId: crypto.randomUUID(),
    slug: `mock-website-${suffix}`,
    title: `Mock Website ${suffix}`,
    faviconMediaId: Option.none(),
    ...overrides,
  };
}

export function createSectionCommand(
  overrides: Partial<CreateSectionCommand> = {},
): CreateSectionCommand {
  return {
    websiteId: crypto.randomUUID(),
    type: "center-text",
    position: 0,
    ...overrides,
  };
}

export function createListSectionsQuery(
  overrides: Partial<ListSectionsQuery> = {},
): ListSectionsQuery {
  return {
    websiteId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createDeleteSectionCommand(
  overrides: Partial<DeleteSectionCommand> = {},
): DeleteSectionCommand {
  return {
    websiteId: crypto.randomUUID(),
    sectionId: crypto.randomUUID(),
    ...overrides,
  };
}

export function createReorderSectionsCommand(
  overrides: Partial<ReorderSectionsCommand> = {},
): ReorderSectionsCommand {
  return {
    websiteId: crypto.randomUUID(),
    sectionIds: [crypto.randomUUID()],
    ...overrides,
  };
}
