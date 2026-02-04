"use server";

import { db, websitesTable } from "@repo/website-database";
import { eq } from "drizzle-orm";

export interface HeroSettings {
  backgroundImageUrl: string;
  logoImageUrl: string;
  title: string;
  subtitle: string;
}

/**
 * Server action to fetch hero settings for a salon by its slug
 */
export async function fetchHeroSettingsBySalonSlug(salonSlug: string): Promise<{
  success: boolean;
  settings?: HeroSettings;
  error?: string;
}> {
  try {
    const [website] = await db
      .select()
      .from(websitesTable)
      .where(eq(websitesTable.slug, salonSlug))
      .limit(1);

    if (!website) {
      return {
        success: false,
        error: "Website not found",
      };
    }

    return {
      success: true,
      settings: {
        backgroundImageUrl: website.heroImage,
        logoImageUrl: website.logo,
        title: website.title,
        subtitle: website.subtitle,
      },
    };
  } catch (error) {
    console.error("Error fetching hero settings:", error);
    return {
      success: false,
      error: "Failed to fetch hero settings",
    };
  }
}
