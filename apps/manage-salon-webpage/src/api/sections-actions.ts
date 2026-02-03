"use server";

import { Section, SectionType } from "@/lib/types/section-types";
import { db } from "@/lib/db";
import {
  sectionsTable,
  textWithImageSectionsTable,
  gallerySectionsTable,
  galleryImagesTable,
} from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

/**
 * Server action to create a new section
 * Takes websiteId, type and position, returns the created section with generated ID
 */
export async function createSection(
  websiteId: string,
  type: SectionType,
  position: number,
): Promise<{ success: boolean; section?: Section; error?: string }> {
  try {
    if (type === "text-with-image") {
      // Insert into sections table
      const [insertedSection] = await db
        .insert(sectionsTable)
        .values({
          websiteId,
          type: "text-with-image",
          order: position,
        })
        .returning();

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

      const newSection: Section = {
        id: insertedSection.id,
        type: "text-with-image",
        settings: {
          imageUrl: insertedTextSection.image,
          title: insertedTextSection.title,
          text: insertedTextSection.content,
        },
        order: insertedSection.order,
      };

      return { success: true, section: newSection };
    } else if (type === "gallery") {
      // Insert into sections table
      const [insertedSection] = await db
        .insert(sectionsTable)
        .values({
          websiteId,
          type: "gallery",
          order: position,
        })
        .returning();

      // Insert into gallery_sections table
      const [insertedGallerySection] = await db
        .insert(gallerySectionsTable)
        .values({
          id: insertedSection.id,
          title: "New Gallery",
          subtitle: "Gallery subtitle",
        })
        .returning();

      const newSection: Section = {
        id: insertedSection.id,
        type: "gallery",
        settings: {
          title: insertedGallerySection.title,
          subtitle: insertedGallerySection.subtitle,
          imageUrls: [],
        },
        order: insertedSection.order,
      };

      return { success: true, section: newSection };
    } else {
      return { success: false, error: "Invalid section type" };
    }
  } catch (error) {
    console.error("Error creating section:", error);
    return { success: false, error: "Failed to create section" };
  }
}

/**
 * Server action to update an existing section
 */
export async function updateSection(
  websiteId: string,
  section: Section,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update sections table
    await db
      .update(sectionsTable)
      .set({
        order: section.order,
      })
      .where(
        and(
          eq(sectionsTable.id, section.id),
          eq(sectionsTable.websiteId, websiteId),
        ),
      );

    // Update type-specific table
    if (section.type === "text-with-image") {
      await db
        .update(textWithImageSectionsTable)
        .set({
          title: section.settings.title,
          content: section.settings.text,
          image: section.settings.imageUrl,
        })
        .where(eq(textWithImageSectionsTable.id, section.id));
    } else if (section.type === "gallery") {
      // Update gallery_sections table
      await db
        .update(gallerySectionsTable)
        .set({
          title: section.settings.title,
          subtitle: section.settings.subtitle,
        })
        .where(eq(gallerySectionsTable.id, section.id));

      // Delete existing images and re-insert
      await db
        .delete(galleryImagesTable)
        .where(eq(galleryImagesTable.gallerySectionId, section.id));

      // Insert new images
      if (section.settings.imageUrls.length > 0) {
        await db.insert(galleryImagesTable).values(
          section.settings.imageUrls.map((url, index) => ({
            gallerySectionId: section.id,
            imageUrl: url,
            order: index,
          })),
        );
      }
    }

    return { success: true };
  } catch (error) {
    console.error("Error updating section:", error);
    return { success: false, error: "Failed to update section" };
  }
}

/**
 * Server action to delete a section
 */
export async function deleteSection(
  websiteId: string,
  id: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    // Delete from sections table (cascades to type-specific tables)
    await db
      .delete(sectionsTable)
      .where(
        and(eq(sectionsTable.id, id), eq(sectionsTable.websiteId, websiteId)),
      );

    return { success: true };
  } catch (error) {
    console.error("Error deleting section:", error);
    return { success: false, error: "Failed to delete section" };
  }
}

/**
 * Server action to reorder sections
 * Takes websiteId and array of section IDs in their new order
 */
export async function reorderSections(
  websiteId: string,
  sectionIds: string[],
): Promise<{ success: boolean; error?: string }> {
  try {
    // Update order for each section
    for (let i = 0; i < sectionIds.length; i++) {
      await db
        .update(sectionsTable)
        .set({ order: i })
        .where(
          and(
            eq(sectionsTable.id, sectionIds[i]),
            eq(sectionsTable.websiteId, websiteId),
          ),
        );
    }

    return { success: true };
  } catch (error) {
    console.error("Error reordering sections:", error);
    return { success: false, error: "Failed to reorder sections" };
  }
}

/**
 * Server action to fetch all sections for a website
 */
export async function fetchSections(websiteId: string): Promise<{
  success: boolean;
  sections?: Section[];
  error?: string;
}> {
  try {
    // Fetch all sections for the website
    const dbSections = await db
      .select()
      .from(sectionsTable)
      .where(eq(sectionsTable.websiteId, websiteId))
      .orderBy(sectionsTable.order);

    const sections: Section[] = [];

    // Fetch details for each section based on type
    for (const dbSection of dbSections) {
      if (dbSection.type === "text-with-image") {
        const [textSection] = await db
          .select()
          .from(textWithImageSectionsTable)
          .where(eq(textWithImageSectionsTable.id, dbSection.id));

        if (textSection) {
          sections.push({
            id: dbSection.id,
            type: "text-with-image",
            settings: {
              imageUrl: textSection.image,
              title: textSection.title,
              text: textSection.content,
            },
            order: dbSection.order,
          });
        }
      } else if (dbSection.type === "gallery") {
        const [gallerySection] = await db
          .select()
          .from(gallerySectionsTable)
          .where(eq(gallerySectionsTable.id, dbSection.id));

        if (gallerySection) {
          // Fetch images for this gallery
          const images = await db
            .select()
            .from(galleryImagesTable)
            .where(eq(galleryImagesTable.gallerySectionId, dbSection.id))
            .orderBy(galleryImagesTable.order);

          sections.push({
            id: dbSection.id,
            type: "gallery",
            settings: {
              title: gallerySection.title,
              subtitle: gallerySection.subtitle,
              imageUrls: images.map((img) => img.imageUrl),
            },
            order: dbSection.order,
          });
        }
      }
    }

    return { success: true, sections };
  } catch (error) {
    console.error("Error fetching sections:", error);
    return { success: false, error: "Failed to fetch sections" };
  }
}
