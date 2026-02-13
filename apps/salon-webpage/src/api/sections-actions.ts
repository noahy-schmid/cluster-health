"use server";

import {
  db,
  websitesTable,
  AllSections,
  sectionRepository,
  Result,
} from "@repo/website-database";
import { eq } from "drizzle-orm";

/**
 * Server action to fetch all sections for a salon by its slug
 */
export async function fetchSectionsBySalonSlug(salonSlug: string): Promise<Result<AllSections[], string>> {
  const [website] = await db
    .select()
    .from(websitesTable)
    .where(eq(websitesTable.slug, salonSlug));

  if (!website) {
    return { success: false, errors: "Website not found" };
  }

  const repository = sectionRepository();
  return await repository.fetchSections(website.id);
}

export interface WebsiteColors {
  backgroundBase: string;
  backgroundElevation1: string;
  backgroundElevation2: string;
  foregroundBase: string;
  foregroundMuted: string;
  foregroundStrong: string;
  accent: string;
  onAccent: string;
}

/**
 * Server action to fetch colors for a salon by its slug
 */
export async function fetchColorsBySalonSlug(salonSlug: string): Promise<{
  success: boolean;
  colors?: WebsiteColors;
  error?: string;
}> {
  try {
    // Get the website by salon slug
    const [website] = await db
      .select({
        colorBackgroundBase: websitesTable.colorBackgroundBase,
        colorBackgroundElevation1: websitesTable.colorBackgroundElevation1,
        colorBackgroundElevation2: websitesTable.colorBackgroundElevation2,
        colorForegroundBase: websitesTable.colorForegroundBase,
        colorForegroundMuted: websitesTable.colorForegroundMuted,
        colorForegroundStrong: websitesTable.colorForegroundStrong,
        colorAccent: websitesTable.colorAccent,
        colorOnAccent: websitesTable.colorOnAccent,
      })
      .from(websitesTable)
      .where(eq(websitesTable.slug, salonSlug));

    if (!website) {
      return { success: false, error: "Website not found" };
    }

    return {
      success: true,
      colors: {
        backgroundBase: website.colorBackgroundBase,
        backgroundElevation1: website.colorBackgroundElevation1,
        backgroundElevation2: website.colorBackgroundElevation2,
        foregroundBase: website.colorForegroundBase,
        foregroundMuted: website.colorForegroundMuted,
        foregroundStrong: website.colorForegroundStrong,
        accent: website.colorAccent,
        onAccent: website.colorOnAccent,
      },
    };
  } catch (error) {
    console.error("Error fetching colors by salon slug:", error);
    return { success: false, error: "Failed to fetch colors" };
  }
}
