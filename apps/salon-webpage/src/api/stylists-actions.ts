"use server";

import { db, websitesTable } from "@repo/website-domain";
import {
  StylistService,
  StylistServiceLive,
  MediaService,
  MediaLayer,
} from "@repo/salon-domain";
import { eq } from "drizzle-orm";
import { Effect, Option, Layer } from "effect";

export interface StylistWithImageUrl {
  id: string;
  salonId: string;
  name: string;
  subtitle: string;
  description: string;
  profileImageUrl?: string;
}

/**
 * Server action to fetch stylists for a salon by its slug.
 * Resolves profileImageMediaId to a S3 URL for each stylist.
 */
export async function fetchStylistsBySalonSlug(salonSlug: string): Promise<{
  success: boolean;
  stylists?: StylistWithImageUrl[];
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

    // Fetch stylists and resolve their profile image URLs
    const fetchEffect = Effect.gen(function* () {
      const stylistService = yield* StylistService;
      const mediaService = yield* MediaService;

      const stylists = yield* stylistService
        .getStylistsBySalonId(website.salonId)
        .pipe(
          Effect.catchAll((error) =>
            Effect.logError("Error fetching stylists", error.name, error).pipe(
              Effect.flatMap(() =>
                Effect.fail(
                  new Error(
                    error instanceof Error
                      ? error.message
                      : "Failed to fetch stylists",
                  ),
                ),
              ),
            ),
          ),
        );

      const stylistsWithUrls: StylistWithImageUrl[] = yield* Effect.all(
        stylists.map((stylist) =>
          Effect.gen(function* () {
            const mediaId = Option.getOrUndefined(stylist.profileImageMediaId);
            if (!mediaId) {
              return {
                id: stylist.id,
                salonId: stylist.salonId,
                name: stylist.name,
                subtitle: stylist.subtitle,
                description: stylist.description,
              };
            }

            const urlResult = yield* mediaService
              .getMediaUrl(mediaId)
              .pipe(Effect.option);

            return {
              id: stylist.id,
              salonId: stylist.salonId,
              name: stylist.name,
              subtitle: stylist.subtitle,
              description: stylist.description,
              profileImageUrl: Option.getOrUndefined(urlResult),
            };
          }),
        ),
      );

      return { success: true, stylists: stylistsWithUrls };
    }).pipe(
      Effect.provide(Layer.merge(StylistServiceLive, MediaLayer)),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          error:
            error instanceof Error ? error.message : "Failed to fetch stylists",
        }),
      ),
    );

    return await Effect.runPromise(fetchEffect);
  } catch (error) {
    console.error("Error fetching stylists by salon slug:", error);
    return {
      success: false,
      error: "Failed to fetch stylists",
    };
  }
}
