"use server";

import { HeroSettings } from "@/lib/types/section-types";
import { db, websitesTable } from "@repo/website-database";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";

/**
 * Server action to create a new website
 * Returns the created website ID
 */
export async function createWebsite(): Promise<
  | {
      success: true;
      websiteId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const newWebsite: typeof websitesTable.$inferInsert = {
    salonId: randomUUID(),
    heroImage: "",
    logo: "",
    slug: `salon-${Date.now()}`,
    title: "Meine Salon Webseite",
    subtitle: "Willkommen auf meiner Salon Webseite",
    colorBackgroundBase: "#FAF8F6",
    colorBackgroundElevation1: "#FFFFFF",
    colorBackgroundElevation2: "#F5F3F1",
    colorForegroundBase: "#1A1A1A",
    colorForegroundMuted: "#6B6B6B",
    colorForegroundStrong: "#000000",
    colorAccent: "#B8845F",
    colorOnAccent: "#FFFFFF",
  };

  try {
    const insertedWebsite = await db
      .insert(websitesTable)
      .values(newWebsite)
      .returning();
    return { success: true, websiteId: insertedWebsite[0].id };
  } catch (error) {
    console.error("Error creating website:", error);
    return {
      success: false,
      error: "Failed to create website",
    };
  }
}

export async function getHeroSettings(websiteId: string): Promise<
  | {
      success: true;
      settings: HeroSettings;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    const [website] = await db
      .select()
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId))
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

export async function updateHeroSettings(
  websiteId: string,
  settings: HeroSettings,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    await db
      .update(websitesTable)
      .set({
        heroImage: settings.backgroundImageUrl,
        logo: settings.logoImageUrl,
        title: settings.title,
        subtitle: settings.subtitle,
      })
      .where(eq(websitesTable.id, websiteId));

    return { success: true };
  } catch (error) {
    console.error("Error updating hero settings:", error);
    return {
      success: false,
      error: "Failed to update hero settings",
    };
  }
}

export interface ColorSettings {
  backgroundBase: string;
  foregroundBase: string;
  accent: string;
}

export interface AllColorSettings extends ColorSettings {
  backgroundElevation1: string;
  backgroundElevation2: string;
  foregroundMuted: string;
  foregroundStrong: string;
  onAccent: string;
}

/**
 * Server action to get color settings for a website
 * Returns only the base colors (backgroundBase, foregroundBase, accent)
 */
export async function getColorSettings(websiteId: string): Promise<
  | {
      success: true;
      colors: ColorSettings;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    const [website] = await db
      .select({
        colorBackgroundBase: websitesTable.colorBackgroundBase,
        colorForegroundBase: websitesTable.colorForegroundBase,
        colorAccent: websitesTable.colorAccent,
      })
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId))
      .limit(1);

    if (!website) {
      return {
        success: false,
        error: "Website not found",
      };
    }

    return {
      success: true,
      colors: {
        backgroundBase: website.colorBackgroundBase,
        foregroundBase: website.colorForegroundBase,
        accent: website.colorAccent,
      },
    };
  } catch (error) {
    console.error("Error fetching color settings:", error);
    return {
      success: false,
      error: "Failed to fetch color settings",
    };
  }
}

/**
 * Server action to update all color settings for a website
 * Accepts both base colors and computed/derived colors
 */
export async function updateColorSettings(
  websiteId: string,
  colors: AllColorSettings,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  try {
    await db
      .update(websitesTable)
      .set({
        colorBackgroundBase: colors.backgroundBase,
        colorBackgroundElevation1: colors.backgroundElevation1,
        colorBackgroundElevation2: colors.backgroundElevation2,
        colorForegroundBase: colors.foregroundBase,
        colorForegroundMuted: colors.foregroundMuted,
        colorForegroundStrong: colors.foregroundStrong,
        colorAccent: colors.accent,
        colorOnAccent: colors.onAccent,
      })
      .where(eq(websitesTable.id, websiteId));

    return { success: true };
  } catch (error) {
    console.error("Error updating color settings:", error);
    return {
      success: false,
      error: "Failed to update color settings",
    };
  }
}
