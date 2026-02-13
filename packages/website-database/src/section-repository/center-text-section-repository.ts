import { db } from "../database";
import { centerTextSectionsTable } from "../schema";
import { eq } from "drizzle-orm";
import { Section, Result } from "./types";
import { SectionTypeRepository } from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class CenterTextSectionRepository implements SectionTypeRepository<"center-text"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<Result<Section<"center-text">, string>> {
    try {
      const result = await db.transaction(async (tx) => {
        // Insert into sections table via base repository
        const insertedSection = await this.baseSectionRepo.createSection(
          websiteId,
          "center-text",
          position,
          tx,
        );

        if (!insertedSection) {
          return { success: false, errors: "Failed to insert section" };
        }

        // Insert into center_text_sections table
        const [insertedCenterTextSection] = await tx
          .insert(centerTextSectionsTable)
          .values({
            id: insertedSection.id,
            title: "Neuer Text Abschnitt",
            content: "Fügen Sie hier Ihren Text hinzu",
          })
          .returning();

        if (!insertedCenterTextSection) {
          return {
            success: false,
            errors: "Failed to insert center text section",
          };
        }

        const newSection: Section<"center-text"> = {
          id: insertedSection.id,
          type: "center-text",
          settings: {
            title: insertedCenterTextSection.title,
            content: insertedCenterTextSection.content,
          },
          order: insertedSection.order,
          menuTitle: insertedSection.menuTitle ?? undefined,
        };

        return { success: true, data: newSection };
      });

      return result;
    } catch (error) {
      console.error("Error creating center text section:", error);
      return {
        success: false,
        errors: "Failed to create center text section",
      };
    }
  }

  async updateSection(
    section: Omit<Section<"center-text">, "type" | "order">,
  ): Promise<Result<void, string>> {
    try {
      await db.transaction(async (tx) => {
        // Update sections table via base repository
        const updatedSections =
          await this.baseSectionRepo.updateSectionMetadata(
            section.id,
            { menuTitle: section.menuTitle ?? null },
            tx,
          );

        // If no rows were updated, section doesn't exist - stop here
        if (updatedSections.length === 0) {
          throw new Error("Section not found");
        }

        // Update center_text_sections table
        await tx
          .update(centerTextSectionsTable)
          .set({
            title: section.settings.title,
            content: section.settings.content,
          })
          .where(eq(centerTextSectionsTable.id, section.id));
      });
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error updating center text section:", error);
      return { success: false, errors: "Failed to update section" };
    }
  }

  async fetchSection(
    id: string,
  ): Promise<Result<Section<"center-text">, string>> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(
        id,
        "center-text",
      );

      if (!dbSection) {
        return { success: false, errors: "Center text section not found" };
      }

      // Fetch center text details
      const [centerTextSection] = await db
        .select()
        .from(centerTextSectionsTable)
        .where(eq(centerTextSectionsTable.id, id));

      if (!centerTextSection) {
        return {
          success: false,
          errors: "Center text section details not found",
        };
      }

      const section: Section<"center-text"> = {
        id: dbSection.id,
        type: "center-text",
        settings: {
          title: centerTextSection.title,
          content: centerTextSection.content,
        },
        order: dbSection.order,
        menuTitle: dbSection.menuTitle ?? undefined,
      };

      return { success: true, data: section };
    } catch (error) {
      console.error("Error fetching center text section:", error);
      return {
        success: false,
        errors: "Failed to fetch center text section",
      };
    }
  }
}
