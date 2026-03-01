import "dotenv/config";

export { db } from "./database";
export * from "./website-repository/website-hero-repository";
export * from "./website-repository/errors";
export * from "./schema";

export * from "./types/website";
export * from "./types/website-errors";
export * from "./application/website/website.interface";
export * from "./layers";

// Section domain types (from aggregate, re-exported via use-cases)
export type {
  SectionType,
  AllSections,
  Section,
  TextWithImageSettings,
  GallerySettings,
  CenterTextSettings,
  ReasonSettings,
  ReasonItem,
  StylistsSettings,
} from "./application/section/section.aggregate";

// Section errors
export {
  SectionValidationError,
  InvalidSectionTypeError,
  SectionNotFoundError,
  SectionError,
} from "./application/section/errors";

// Section use cases
export {
  CreateSectionUseCase,
  type CreateSectionCommand,
  type CreateSectionResult,
} from "./use-cases/create-section.use-case";

export {
  UpdateSectionUseCase,
  type UpdateSectionCommand,
} from "./use-cases/update-section.use-case";

export {
  DeleteSectionUseCase,
  type DeleteSectionCommand,
} from "./use-cases/delete-section.use-case";

export {
  ReorderSectionsUseCase,
  type ReorderSectionsCommand,
} from "./use-cases/reorder-sections.use-case";

export {
  ListSectionsUseCase,
  type ListSectionsQuery,
  type ListSectionsResult,
} from "./use-cases/list-sections.use-case";

// Result type
export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; errors: E };
