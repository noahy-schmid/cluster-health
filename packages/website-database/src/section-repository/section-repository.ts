import { db, sectionsTable } from "../index";
import { eq, and } from "drizzle-orm";
import { AllSections, SectionType, Result } from "./types";
import { GallerySectionRepository } from "./gallery-section-repository";
import { TextWithImageSectionRepository } from "./text-with-image-section-repository";
import { CenterTextSectionRepository } from "./center-text-section-repository";
import { ReasonSectionRepository } from "./reason-section-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class SectionRepository {
  private readonly repositoryMap: Record<
    SectionType,
    GallerySectionRepository | TextWithImageSectionRepository | CenterTextSectionRepository | ReasonSectionRepository
  >;

  constructor(
    private baseSectionRepo: BaseSectionRepository,
    private gallerySectionRepo: GallerySectionRepository,
    private textWithImageSectionRepo: TextWithImageSectionRepository,
    private centerTextSectionRepo: CenterTextSectionRepository,
    private reasonSectionRepo: ReasonSectionRepository,
  ) {
    this.repositoryMap = {
      gallery: this.gallerySectionRepo,
      "text-with-image": this.textWithImageSectionRepo,
      "center-text": this.centerTextSectionRepo,
      reason: this.reasonSectionRepo,
    };
  }

  private getRepositoryForType(type: SectionType) {
    const repository = this.repositoryMap[type];
    if (!repository) {
      throw new Error(`Invalid section type: ${type}`);
    }
    return repository;
  }

  async createSection(
    websiteId: string,
    type: SectionType,
    position: number,
  ): Promise<Result<AllSections, string>> {
    try {
      const repository = this.getRepositoryForType(type);
      return await repository.createSection(websiteId, position);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Invalid section type:")) {
        return { success: false, errors: error.message };
      }
      throw error;
    }
  }

  async updateSection(
    section: AllSections,
  ): Promise<Result<void, string>> {
    try {
      const repository = this.getRepositoryForType(section.type);
      return await repository.updateSection(section);
    } catch (error) {
      if (error instanceof Error && error.message.startsWith("Invalid section type:")) {
        return { success: false, errors: error.message };
      }
      console.error("Error updating section:", error);
      return { success: false, errors: "Failed to update section" };
    }
  }

  async deleteSection(
    websiteId: string,
    id: string,
  ): Promise<Result<void, string>> {
    try {
      await this.baseSectionRepo.deleteSectionById(id, websiteId);
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error deleting section:", error);
      return { success: false, errors: "Failed to delete section" };
    }
  }

  async reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Promise<Result<void, string>> {
    try {
      await db.transaction(async (tx) => {
        // Update order for each section within a single transaction
        for (let i = 0; i < sectionIds.length; i++) {
          const sectionId = sectionIds[i];
          if (!sectionId) continue;

          await tx
            .update(sectionsTable)
            .set({ order: i })
            .where(
              and(
                eq(sectionsTable.id, sectionId),
                eq(sectionsTable.websiteId, websiteId),
              ),
            );
        }
      });

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error reordering sections:", error);
      return { success: false, errors: "Failed to reorder sections" };
    }
  }

  async fetchSections(websiteId: string): Promise<Result<AllSections[], string>> {
    try {
      // Fetch all sections for the website
      const dbSections = await db
        .select()
        .from(sectionsTable)
        .where(eq(sectionsTable.websiteId, websiteId))
        .orderBy(sectionsTable.order);

      const sections: AllSections[] = [];

      // Fetch details for each section based on type
      for (const dbSection of dbSections) {
        try {
          const repository = this.getRepositoryForType(dbSection.type);
          const result = await repository.fetchSection(dbSection.id);
          if (result.success) {
            sections.push(result.data);
          }
        } catch (error) {
          // Skip sections with invalid types but log the error
          if (error instanceof Error && error.message.startsWith("Invalid section type:")) {
            console.error(`Skipping section ${dbSection.id}: ${error.message}`);
          } else {
            throw error;
          }
        }
      }

      return { success: true, data: sections };
    } catch (error) {
      console.error("Error fetching sections:", error);
      return { success: false, errors: "Failed to fetch sections" };
    }
  }
}

export const sectionRepository = () => {
  const baseRepo = new BaseSectionRepository();
  return new SectionRepository(
    baseRepo,
    new GallerySectionRepository(baseRepo),
    new TextWithImageSectionRepository(baseRepo),
    new CenterTextSectionRepository(baseRepo),
    new ReasonSectionRepository(baseRepo),
  );
};
