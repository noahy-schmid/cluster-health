import { db, textWithImageSectionsTable } from "../index";
import { eq } from "drizzle-orm";
import { Section } from "./types";
import {
  SectionTypeRepository,
  CreateSectionResult,
  FetchSectionResult,
} from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class TextWithImageSectionRepository implements SectionTypeRepository<"text-with-image"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<CreateSectionResult<"text-with-image">> {
    try {
      // Insert into sections table via base repository
      const insertedSection = await this.baseSectionRepo.createSection(
        websiteId,
        "text-with-image",
        position,
      );

      if (!insertedSection) {
        return { success: false, error: "Failed to insert section" };
      }

      // Insert into text_with_image_sections table
      const [insertedTextSection] = await db
        .insert(textWithImageSectionsTable)
        .values({
          id: insertedSection.id,
          title: "New Text with Image Section",
          content: "Add your text here",
          image: "",
        })
        .returning();

      if (!insertedTextSection) {
        return {
          success: false,
          error: "Failed to insert text with image section",
        };
      }

      const newSection: Section<"text-with-image"> = {
        id: insertedSection.id,
        type: "text-with-image",
        settings: {
          imageUrl: insertedTextSection.image,
          title: insertedTextSection.title,
          text: insertedTextSection.content,
        },
        order: insertedSection.order,
        menuTitle: insertedSection.menuTitle ?? undefined,
      };

      return { success: true, section: newSection };
    } catch (error) {
      console.error("Error creating text with image section:", error);
      return {
        success: false,
        error: "Failed to create text with image section",
      };
    }
  }

  async updateSection(
    section: Omit<Section<"text-with-image">, "type" | "order">,
  ): Promise<boolean> {
    try {
      return await db.transaction(async (tx) => {
        // Update sections table via base repository
        const updatedSections =
          await this.baseSectionRepo.updateSectionMetadata(
            section.id,
            { menuTitle: section.menuTitle ?? null },
            tx,
          );

        // If no rows were updated, section doesn't exist - stop here
        if (updatedSections.length === 0) {
          return false;
        }

        // Update text_with_image_sections table
        await tx
          .update(textWithImageSectionsTable)
          .set({
            title: section.settings.title,
            content: section.settings.text,
            image: section.settings.imageUrl,
          })
          .where(eq(textWithImageSectionsTable.id, section.id));

        return true;
      });
    } catch (error) {
      console.error("Error updating text with image section:", error);
      return false;
    }
  }

  async fetchSection(
    id: string,
  ): Promise<FetchSectionResult<"text-with-image">> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(
        id,
        "text-with-image",
      );

      if (!dbSection) {
        return { success: false, error: "Text with image section not found" };
      }

      // Fetch text with image details
      const [textSection] = await db
        .select()
        .from(textWithImageSectionsTable)
        .where(eq(textWithImageSectionsTable.id, id));

      if (!textSection) {
        return {
          success: false,
          error: "Text with image section details not found",
        };
      }

      const section: Section<"text-with-image"> = {
        id: dbSection.id,
        type: "text-with-image",
        settings: {
          imageUrl: textSection.image,
          title: textSection.title,
          text: textSection.content,
        },
        order: dbSection.order,
        menuTitle: dbSection.menuTitle ?? undefined,
      };

      return { success: true, section };
    } catch (error) {
      console.error("Error fetching text with image section:", error);
      return {
        success: false,
        error: "Failed to fetch text with image section",
      };
    }
  }
}
