import { db, sectionsTable } from "../index";
import { eq, and } from "drizzle-orm";
import { AllSections, SectionType } from "./types";
import { GallerySectionRepository } from "./gallery-section-repository";
import { TextWithImageSectionRepository } from "./text-with-image-section-repository";
import { CenterTextSectionRepository } from "./center-text-section-repository";
import { ReasonSectionRepository } from "./reason-section-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class SectionRepository {
  constructor(
    private baseSectionRepo: BaseSectionRepository,
    private gallerySectionRepo: GallerySectionRepository,
    private textWithImageSectionRepo: TextWithImageSectionRepository,
    private centerTextSectionRepo: CenterTextSectionRepository,
    private reasonSectionRepo: ReasonSectionRepository,
  ) {}

  async createSection(
    websiteId: string,
    type: SectionType,
    position: number,
  ): Promise<{ success: boolean; section?: AllSections; error?: string }> {
    if (type === "gallery") {
      return await this.gallerySectionRepo.createSection(websiteId, position);
    } else if (type === "text-with-image") {
      return await this.textWithImageSectionRepo.createSection(
        websiteId,
        position,
      );
    } else if (type === "center-text") {
      return await this.centerTextSectionRepo.createSection(
        websiteId,
        position,
      );
    } else if (type === "reason") {
      return await this.reasonSectionRepo.createSection(websiteId, position);
    }

    return { success: false, error: "Invalid section type" };
  }

  async updateSection(
    section: AllSections,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      let result: boolean;

      if (section.type === "gallery") {
        result = await this.gallerySectionRepo.updateSection(section);
      } else if (section.type === "text-with-image") {
        result = await this.textWithImageSectionRepo.updateSection(section);
      } else if (section.type === "center-text") {
        result = await this.centerTextSectionRepo.updateSection(section);
      } else if (section.type === "reason") {
        result = await this.reasonSectionRepo.updateSection(section);
      } else {
        return { success: false, error: "Invalid section type" };
      }

      return result
        ? { success: true }
        : { success: false, error: "Failed to update section" };
    } catch (error) {
      console.error("Error updating section:", error);
      return { success: false, error: "Failed to update section" };
    }
  }

  async deleteSection(
    websiteId: string,
    id: string,
  ): Promise<{ success: boolean; error?: string }> {
    try {
      await this.baseSectionRepo.deleteSectionById(id, websiteId);
      return { success: true };
    } catch (error) {
      console.error("Error deleting section:", error);
      return { success: false, error: "Failed to delete section" };
    }
  }

  async reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Promise<{ success: boolean; error?: string }> {
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

      return { success: true };
    } catch (error) {
      console.error("Error reordering sections:", error);
      return { success: false, error: "Failed to reorder sections" };
    }
  }

  async fetchSections(websiteId: string): Promise<{
    success: boolean;
    sections?: AllSections[];
    error?: string;
  }> {
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
        if (dbSection.type === "text-with-image") {
          const result = await this.textWithImageSectionRepo.fetchSection(
            dbSection.id,
          );
          if (result.success) {
            sections.push(result.section);
          }
        } else if (dbSection.type === "gallery") {
          const result = await this.gallerySectionRepo.fetchSection(
            dbSection.id,
          );
          if (result.success) {
            sections.push(result.section);
          }
        } else if (dbSection.type === "center-text") {
          const result = await this.centerTextSectionRepo.fetchSection(
            dbSection.id,
          );
          if (result.success) {
            sections.push(result.section);
          }
        } else if (dbSection.type === "reason") {
          const result = await this.reasonSectionRepo.fetchSection(
            dbSection.id,
          );
          if (result.success) {
            sections.push(result.section);
          }
        }
      }

      return { success: true, sections };
    } catch (error) {
      console.error("Error fetching sections:", error);
      return { success: false, error: "Failed to fetch sections" };
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
