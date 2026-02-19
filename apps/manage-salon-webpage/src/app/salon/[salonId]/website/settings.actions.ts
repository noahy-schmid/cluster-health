"use server";

import { AuthGuard } from "@/api/guards/auth.guard";
import { WebsiteAccessGuard } from "@/api/guards/website.guard";
import { SalonRepository } from "@repo/salon-domain";
import { db, websitesTable } from "@repo/website-database";
import { eq } from "drizzle-orm";

/**
 * Helper function to convert a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server action to get initial values for the website creation form
 * Returns pre-filled values based on salon data
 */
export async function getWebsiteInitialValues(): Promise<
  | {
      success: true;
      slug: string;
      title: string;
      faviconUrl: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const authToken = await AuthGuard.getAuthToken();

  if (!authToken) {
    return { success: false, error: "Ungültige Sitzung" };
  }

  if (!authToken.salonId) {
    return { success: false, error: "Kein Salon zugeordnet" };
  }

  const salonRepository = new SalonRepository();
  const salonResult = await salonRepository.fetchSalonById(authToken.salonId);

  if (!salonResult.success) {
    return { success: false, error: "Salon nicht gefunden" };
  }

  const salon = salonResult.data;

  return {
    success: true,
    slug: slugify(salon.name),
    title: `${salon.name} - Dein Salon`,
    faviconUrl: "",
  };
}

/**
 * Server action to create a new website with custom settings
 * @param slug - URL slug for the website
 * @param title - Page title for browser tabs and SEO
 * @param _faviconUrl - Optional URL to favicon image (not yet stored in DB)
 * @returns Result with the created website ID or error
 */
export async function createWebsite(
  slug: string,
  title: string,
  _faviconUrl: string,
): Promise<
  | {
      success: true;
      websiteId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const authToken = await AuthGuard.getAuthToken();

  if (!authToken) {
    return { success: false, error: "Ungültige Sitzung" };
  }

  if (!authToken.salonId) {
    return { success: false, error: "Kein Salon zugeordnet" };
  }

  // Check if website already exists for this salon
  const [existingWebsite] = await db
    .select({ id: websitesTable.id })
    .from(websitesTable)
    .where(eq(websitesTable.salonId, authToken.salonId));

  if (existingWebsite) {
    return { success: false, error: "Website already exists" };
  }

  const newWebsite: typeof websitesTable.$inferInsert = {
    salonId: authToken.salonId,
    heroImage: "",
    logo: "",
    slug: slug,
    title: title,
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

/**
 * Server action to update website settings
 * @param websiteId - ID of the website to update
 * @param slug - URL slug for the website
 * @param title - Page title for browser tabs and SEO
 * @param _faviconUrl - Optional URL to favicon image (not yet stored in DB)
 * @returns Result indicating success or error
 */
export async function updateWebsiteSettings(
  websiteId: string,
  slug: string,
  title: string,
  _faviconUrl: string,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  const canAccess = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!canAccess.success) {
    return { success: false, error: canAccess.error };
  }

  try {
    await db
      .update(websitesTable)
      .set({
        slug: slug,
        title: title,
        // Note: faviconUrl is not stored in the database yet
        // but we accept it for future use
      })
      .where(eq(websitesTable.id, websiteId));

    return { success: true };
  } catch (error) {
    console.error("Error updating website settings:", error);
    return {
      success: false,
      error: "Failed to update settings",
    };
  }
}
