import { Section, SectionType, Result } from "./types";

export interface SectionTypeRepository<T extends SectionType> {
  createSection: (
    websiteId: string,
    position: number,
  ) => Promise<Result<Section<T>, string>>;

  updateSection: (
    section: Omit<Section<T>, "type" | "order">,
  ) => Promise<Result<void, string>>;

  fetchSection: (id: string) => Promise<Result<Section<T>, string>>;
}
