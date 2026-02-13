import { db } from "../database";
import { textWithImageSectionsTable } from "../schema";
import { eq } from "drizzle-orm";
import { Section, Result } from "./types";
import { SectionTypeRepository } from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class TextWithImageSectionRepository implements SectionTypeRepository<"text-with-image"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<Result<Section<"text-with-image">, string>> {
    try {
      const result = await db.transaction(async (tx) => {
        // Insert into sections table via base repository
        const insertedSection = await this.baseSectionRepo.createSection(
          websiteId,
          "text-with-image",
          position,
          tx,
        );

        if (!insertedSection) {
          return { success: false as const, errors: "Failed to insert section" };
        }

        // Insert into text_with_image_sections table
        const [insertedTextSection] = await tx
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
            success: false as const,
            errors: "Failed to insert text with image section",
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

        return { success: true as const, data: newSection };
      });

      return result;
    } catch (error) {
      console.error("Error creating text with image section:", error);
      return {
        success: false,
        errors: "Failed to create text with image section",
      };
    }
  }

  async updateSection(
    section: Omit<Section<"text-with-image">, "type" | "order">,
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

        // Update text_with_image_sections table
        await tx
          .update(textWithImageSectionsTable)
          .set({
            title: section.settings.title,
            content: section.settings.text,
            image: section.settings.imageUrl,
          })
          .where(eq(textWithImageSectionsTable.id, section.id));
      });

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error updating text with image section:", error);
      if (error instanceof Error && error.message === "Section not found") {
        return { success: false, errors: "Section not found" };
      }
      return { success: false, errors: "Failed to update section" };
    }
  }

  async fetchSection(
    id: string,
  ): Promise<Result<Section<"text-with-image">, string>> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(
        id,
        "text-with-image",
      );

      if (!dbSection) {
        return { success: false, errors: "Text with image section not found" };
      }

      // Fetch text with image details
      const [textSection] = await db
        .select()
        .from(textWithImageSectionsTable)
        .where(eq(textWithImageSectionsTable.id, id));

      if (!textSection) {
        return {
          success: false,
          errors: "Text with image section details not found",
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

      return { success: true, data: section };
    } catch (error) {
      console.error("Error fetching text with image section:", error);
      return {
        success: false,
        errors: "Failed to fetch text with image section",
      };
    }
  }
}
