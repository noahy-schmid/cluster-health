import { Section, SectionType } from "./types";

export type CreateSectionResult<T extends SectionType> =
  | {
      success: true;
      section: Section<T>;
    }
  | {
      success: false;
      error: string;
    };

export type FetchSectionResult<T extends SectionType> =
  | {
      success: true;
      section: Section<T>;
    }
  | {
      success: false;
      error: string;
    };

export interface SectionTypeRepository<T extends SectionType> {
  createSection: (
    websiteId: string,
    position: number,
  ) => Promise<CreateSectionResult<T>>;

  updateSection: (
    section: Omit<Section<T>, "type" | "order">,
  ) => Promise<boolean>;

  fetchSection: (id: string) => Promise<FetchSectionResult<T>>;
}
