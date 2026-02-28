"use server";

import {
  db,
  websitesTable,
  AllSections,
  SectionUseCase,
  SectionLayer,
  Result,
} from "@repo/website-database";
import { eq } from "drizzle-orm";
import { oklch } from "culori";
import { Effect } from "effect";

/**
 * Server action to fetch all sections for a salon by its slug
 */
export async function fetchSectionsBySalonSlug(
  salonSlug: string,
): Promise<Result<AllSections[], string>> {
  const [website] = await db
    .select()
    .from(websitesTable)
    .where(eq(websitesTable.slug, salonSlug));

  if (!website) {
    return { success: false, errors: "Website not found" };
  }

  const fetchEffect = Effect.gen(function* () {
    const useCase = yield* SectionUseCase;
    return yield* useCase.fetchSections(website.id).pipe(
      Effect.map((data) => ({ success: true as const, data })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors:
            error instanceof Error ? error.message : "Failed to fetch sections",
        }),
      ),
    );
  }).pipe(Effect.provide(SectionLayer));

  return await Effect.runPromise(fetchEffect);
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
  mode?: "light" | "dark";
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

    const bgOkLch = oklch(website.colorBackgroundBase);
    const fgOkLch = oklch(website.colorForegroundBase);

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
        mode: (bgOkLch?.l ?? 0) > (fgOkLch?.l ?? 0) ? "light" : "dark",
      },
    };
  } catch (error) {
    console.error("Error fetching colors by salon slug:", error);
    return { success: false, error: "Failed to fetch colors" };
  }
}
