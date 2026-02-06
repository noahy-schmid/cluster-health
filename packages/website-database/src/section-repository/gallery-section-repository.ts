import { db } from "../database";
import { gallerySectionsTable, galleryImagesTable } from "../schema";
import { eq } from "drizzle-orm";
import { Section } from "./types";
import {
  SectionTypeRepository,
  CreateSectionResult,
  FetchSectionResult,
} from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class GallerySectionRepository implements SectionTypeRepository<"gallery"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<CreateSectionResult<"gallery">> {
    try {
      // Insert into sections table via base repository
      const insertedSection = await this.baseSectionRepo.createSection(
        websiteId,
        "gallery",
        position,
      );

      if (!insertedSection) {
        return { success: false, error: "Failed to insert section" };
      }

      // Insert into gallery_sections table
      const [insertedGallerySection] = await db
        .insert(gallerySectionsTable)
        .values({
          id: insertedSection.id,
          title: "New Gallery",
          subtitle: "Gallery subtitle",
        })
        .returning();

      if (!insertedGallerySection) {
        return { success: false, error: "Failed to insert gallery section" };
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

      return { success: true, section: newSection };
    } catch (error) {
      console.error("Error creating gallery section:", error);
      return { success: false, error: "Failed to create gallery section" };
    }
  }

  async updateSection(
    section: Omit<Section<"gallery">, "type" | "order">,
  ): Promise<boolean> {
    try {
      return await db.transaction(async (tx) => {
        // Update sections table via base repository
        const updatedSections = await this.baseSectionRepo.updateSectionMetadata(
          section.id,
          { menuTitle: section.menuTitle ?? null },
          tx,
        );

        // If no rows were updated, section doesn't exist - stop here
        if (updatedSections.length === 0) {
          return false;
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

        return true;
      });
    } catch (error) {
      console.error("Error updating gallery section:", error);
      return false;
    }
  }

  async fetchSection(id: string): Promise<FetchSectionResult<"gallery">> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(id, "gallery");

      if (!dbSection) {
        return { success: false, error: "Gallery section not found" };
      }

      // Fetch gallery details
      const [gallerySection] = await db
        .select()
        .from(gallerySectionsTable)
        .where(eq(gallerySectionsTable.id, id));

      if (!gallerySection) {
        return { success: false, error: "Gallery section details not found" };
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

      return { success: true, section };
    } catch (error) {
      console.error("Error fetching gallery section:", error);
      return { success: false, error: "Failed to fetch gallery section" };
    }
  }
}

