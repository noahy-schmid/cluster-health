"use server";

import {
  SectionType,
  AllSections,
  sectionRepository,
  Result,
} from "@repo/website-database";
import { WebsiteAccessGuard } from "@/api/guards/website-access-guard";

/**
 * Server action to create a new section
 * Takes websiteId, type and position, returns the created section with generated ID
 */
export async function createSection(
  websiteId: string,
  type: SectionType,
  position: number,
): Promise<Result<AllSections, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const repository = sectionRepository();
  return await repository.createSection(websiteId, type, position);
}

/**
 * Server action to update an existing section
 */
export async function updateSection(websiteId: string, section: AllSections): Promise<Result<void, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const repository = sectionRepository();

  // Ensure the section being updated actually belongs to the given website
  const fetchResult = await repository.fetchSections(websiteId);
  if (!fetchResult.success) {
    return {
      success: false,
      errors: fetchResult.errors || "Failed to load sections for update",
    };
  }

  const ownsSection = fetchResult.data.some(
    (existingSection) => existingSection.id === section.id,
  );

  if (!ownsSection) {
    return {
      success: false,
      errors: "Section does not belong to this website",
    };
  }
  return await repository.updateSection(section);
}

/**
 * Server action to delete a section
 */
export async function deleteSection(websiteId: string, id: string): Promise<Result<void, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const repository = sectionRepository();
  return await repository.deleteSection(websiteId, id);
}

/**
 * Server action to reorder sections
 * Takes websiteId and array of section IDs in their new order
 */
export async function reorderSections(websiteId: string, sectionIds: string[]): Promise<Result<void, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const repository = sectionRepository();
  return await repository.reorderSections(websiteId, sectionIds);
}

/**
 * Server action to fetch all sections for a website
 */
export async function fetchSections(websiteId: string): Promise<Result<AllSections[], string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const repository = sectionRepository();
  return await repository.fetchSections(websiteId);
}
