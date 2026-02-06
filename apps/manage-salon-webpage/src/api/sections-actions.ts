"use server";

import {
  db,
  sectionsTable,
  textWithImageSectionsTable,
  gallerySectionsTable,
  galleryImagesTable,
  SectionType,
  Section,
  AllSections,
  sectionRepository,
  SectionRepository,
} from "@repo/website-database";
import { eq, and } from "drizzle-orm";

/**
 * Server action to create a new section
 * Takes websiteId, type and position, returns the created section with generated ID
 */
export async function createSection(
  websiteId: string,
  type: SectionType,
  position: number,
) {
  const repository = sectionRepository();
  return await repository.createSection(websiteId, type, position);
}

/**
 * Server action to update an existing section
 */
export async function updateSection(websiteId: string, section: AllSections) {
  const repository = sectionRepository();
  return await repository.updateSection(section);
}

/**
 * Server action to delete a section
 */
export async function deleteSection(websiteId: string, id: string) {
  const repository = sectionRepository();
  return await repository.deleteSection(websiteId, id);
}

/**
 * Server action to reorder sections
 * Takes websiteId and array of section IDs in their new order
 */
export async function reorderSections(websiteId: string, sectionIds: string[]) {
  const repository = sectionRepository();
  return await repository.reorderSections(websiteId, sectionIds);
}

/**
 * Server action to fetch all sections for a website
 */
export async function fetchSections(websiteId: string) {
  const repository = sectionRepository();
  const result = await repository.fetchSections(websiteId);

  if (result.success && result.sections) {
    return { success: true, sections: result.sections };
  } else {
    return {
      success: false,
      error: result.error || "Failed to fetch sections",
    };
  }
}
