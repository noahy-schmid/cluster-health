"use server";

import {
  db,
  websitesTable,
  sectionsTable,
  textWithImageSectionsTable,
  gallerySectionsTable,
  galleryImagesTable,
} from "@repo/website-database";
import { eq } from "drizzle-orm";

export type SectionType = "text-with-image" | "gallery";

// Settings for Text with Image section
export interface TextWithImageSettings {
  imageUrl: string;
  title: string;
  text: string;
}

// Settings for Gallery section
export interface GallerySettings {
  title: string;
  subtitle: string;
  imageUrls: string[];
}

// Discriminated union for sections based on type
export type Section =
  | {
      id: string;
      type: "text-with-image";
      settings: TextWithImageSettings;
      order: number;
      menuTitle?: string;
    }
  | {
      id: string;
      type: "gallery";
      settings: GallerySettings;
      order: number;
      menuTitle?: string;
    };

/**
 * Server action to fetch all sections for a salon by its slug
 */
export async function fetchSectionsBySalonSlug(salonSlug: string): Promise<{
  success: boolean;
  sections?: Section[];
  error?: string;
}> {
  try {
    // First, get the website by salon slug
    const [website] = await db
      .select()
      .from(websitesTable)
      .where(eq(websitesTable.slug, salonSlug));

    if (!website) {
      return { success: false, error: "Website not found" };
    }

    // Fetch all sections for the website
    const dbSections = await db
      .select()
      .from(sectionsTable)
      .where(eq(sectionsTable.websiteId, website.id))
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
            menuTitle: dbSection.menuTitle || undefined,
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
              imageUrls: images.map(
                (img: { imageUrl: string }) => img.imageUrl,
              ),
            },
            order: dbSection.order,
            menuTitle: dbSection.menuTitle || undefined,
          });
        }
      }
    }

    return { success: true, sections };
  } catch (error) {
    console.error("Error fetching sections by salon slug:", error);
    return { success: false, error: "Failed to fetch sections" };
  }
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
