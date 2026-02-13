import { db } from "../database";
import { gallerySectionsTable, galleryImagesTable } from "../schema";
import { eq } from "drizzle-orm";
import { Section, Result } from "./types";
import { SectionTypeRepository } from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class GallerySectionRepository implements SectionTypeRepository<"gallery"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<Result<Section<"gallery">, string>> {
    try {
      const result = await db.transaction(
        async (tx): Promise<Result<Section<"gallery">, string>> => {
          // Insert into sections table via base repository within the transaction
          const insertedSection = await this.baseSectionRepo.createSection(
            websiteId,
            "gallery",
            position,
            tx,
          );

          if (!insertedSection) {
            return { success: false, errors: "Failed to insert section" };
          }

          // Insert into gallery_sections table within the same transaction
          const [insertedGallerySection] = await tx
            .insert(gallerySectionsTable)
            .values({
              id: insertedSection.id,
              title: "New Gallery",
              subtitle: "Gallery subtitle",
            })
            .returning();

          if (!insertedGallerySection) {
            return {
              success: false,
              errors: "Failed to insert gallery section",
            };
          }

          const newSection: Section<"gallery"> = {
            id: insertedSection.id,
            type: "gallery",
            settings: {
              title: insertedGallerySection.title,
              subtitle: insertedGallerySection.subtitle,
              imageUrls: [],
            },
            order: insertedSection.order,
            menuTitle: insertedSection.menuTitle ?? undefined,
          };

          return { success: true, data: newSection };
        },
      );

      return result;
    } catch (error) {
      console.error("Error creating gallery section:", error);
      return { success: false, errors: "Failed to create gallery section" };
    }
  }

  async updateSection(
    section: Omit<Section<"gallery">, "type" | "order">,
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

        // Update gallery_sections table
        await tx
          .update(gallerySectionsTable)
          .set({
            title: section.settings.title,
            subtitle: section.settings.subtitle,
          })
          .where(eq(gallerySectionsTable.id, section.id));

        // Delete existing images and re-insert
        await tx
          .delete(galleryImagesTable)
          .where(eq(galleryImagesTable.gallerySectionId, section.id));

        // Insert new images
        if (section.settings.imageUrls.length > 0) {
          await tx.insert(galleryImagesTable).values(
            section.settings.imageUrls.map((url, index) => ({
              gallerySectionId: section.id,
              imageUrl: url,
              order: index,
            })),
          );
        }
      });

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error updating gallery section:", error);
      if (error instanceof Error && error.message === "Section not found") {
        return { success: false, errors: "Section not found" };
      }
      return { success: false, errors: "Failed to update section" };
    }
  }

  async fetchSection(id: string): Promise<Result<Section<"gallery">, string>> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(
        id,
        "gallery",
      );

      if (!dbSection) {
        return { success: false, errors: "Gallery section not found" };
      }

      // Fetch gallery details
      const [gallerySection] = await db
        .select()
        .from(gallerySectionsTable)
        .where(eq(gallerySectionsTable.id, id));

      if (!gallerySection) {
        return { success: false, errors: "Gallery section details not found" };
      }

      // Fetch images for this gallery
      const images = await db
        .select()
        .from(galleryImagesTable)
        .where(eq(galleryImagesTable.gallerySectionId, id))
        .orderBy(galleryImagesTable.order);

      const section: Section<"gallery"> = {
        id: dbSection.id,
        type: "gallery",
        settings: {
          title: gallerySection.title,
          subtitle: gallerySection.subtitle,
          imageUrls: images.map((img) => img.imageUrl),
        },
        order: dbSection.order,
        menuTitle: dbSection.menuTitle ?? undefined,
      };

      return { success: true, data: section };
    } catch (error) {
      console.error("Error fetching gallery section:", error);
      return { success: false, errors: "Failed to fetch gallery section" };
    }
  }
}
