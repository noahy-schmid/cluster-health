import "dotenv/config";

export { db } from "./database";
export * from "./website-repository/website-hero-repository";
export * from "./website-repository/errors";
export * from "./schema";

export * from "./types/website";
export * from "./types/website-errors";
export * from "./types/media-errors";
export * from "./services/website/website.interface";
export * from "./services/media/media.interface";
export * from "./layers";

// Section use-case exports (DDD structure)
export { SectionUseCase } from "./use-cases/section.interface";
export {
  type SectionType,
  type AllSections,
  type Section,
  type TextWithImageSettings,
  type GallerySettings,
  type CenterTextSettings,
  type ReasonSettings,
  type ReasonItem,
  type StylistsSettings,
  type Result,
  SectionValidationError,
  InvalidSectionTypeError,
  SectionNotFoundError,
  SectionError,
} from "./use-cases/section.interface";
