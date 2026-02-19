"use server";

import { db, websitesTable } from "@repo/website-database";
import {
  StylistService,
  StylistServiceLive,
  Stylist,
} from "@repo/salon-domain";
import { eq } from "drizzle-orm";
import { Effect } from "effect";

/**
 * Server action to fetch stylists for a salon by its slug
 */
export async function fetchStylistsBySalonSlug(salonSlug: string): Promise<{
  success: boolean;
  stylists?: Stylist[];
  error?: string;
}> {
  try {
    // First get the website by slug to find the salonId
    const [website] = await db
      .select({ salonId: websitesTable.salonId })
      .from(websitesTable)
      .where(eq(websitesTable.slug, salonSlug));

    if (!website) {
      return { success: false, error: "Website not found" };
    }

    // Fetch stylists using the service layer
    const fetchEffect = Effect.gen(function* () {
      const service = yield* StylistService;
      return yield* service.getStylistsBySalonId(website.salonId).pipe(
        Effect.map((stylists) => ({ success: true, stylists })),
        Effect.catchAll((error) =>
          Effect.logError("Error fetching stylists", error.name, error).pipe(
            Effect.map(() => ({
              success: false,
              error:
                error instanceof Error
                  ? error.message
                  : "Failed to fetch stylists",
            })),
          ),
        ),
      );
    }).pipe(Effect.provide(StylistServiceLive));

    return await Effect.runPromise(fetchEffect);
  } catch (error) {
    console.error("Error fetching stylists by salon slug:", error);
    return {
      success: false,
      error: "Failed to fetch stylists",
    };
  }
}
