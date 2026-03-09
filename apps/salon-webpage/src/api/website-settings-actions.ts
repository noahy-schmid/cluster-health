"use server";

import { WebsiteService, WebsiteLayer } from "@repo/website-domain";
import { MediaService, MediaLayer } from "@repo/salon-domain";
import { Effect, Option, Layer } from "effect";
import { unstable_cache } from "next/cache";

/**
 * Server action to fetch website metadata settings (title, favicon) for a salon by its slug.
 * Resolves faviconMediaId to a S3 URL.
 */
export const fetchWebsiteMetadataSettingsBySalonSlug = unstable_cache(
  async (
    salonSlug: string,
  ): Promise<{
    success: boolean;
    settings?: {
      title: string;
      favicon: string | null;
    };
    error?: string;
  }> => {
    const fetchEffect = Effect.gen(function* () {
      const websiteService = yield* WebsiteService;
      const mediaService = yield* MediaService;

      const settings = yield* websiteService
        .getWebsiteSettingsBySlug(salonSlug)
        .pipe(
          Effect.catchTag("WebsiteNotFoundError", () =>
            Effect.fail(new Error("Website not found")),
          ),
        );

      const faviconMediaId = Option.getOrUndefined(settings.faviconMediaId);
      let favicon: string | null = null;

      if (faviconMediaId) {
        const urlResult = yield* mediaService
          .getMediaUrl(faviconMediaId)
          .pipe(Effect.option);
        favicon = Option.getOrNull(urlResult);
      }

      return {
        success: true,
        settings: {
          title: settings.title,
          favicon,
        },
      };
    }).pipe(
      Effect.provide(Layer.merge(WebsiteLayer, MediaLayer)),
      Effect.catchAll((error) =>
        Effect.logError("Error fetching website metadata settings", error).pipe(
          Effect.map(() => ({
            success: false,
            error: error instanceof Error ? error.message : "Unknown error",
          })),
        ),
      ),
    );

    return await Effect.runPromise(fetchEffect);
  },
  ["website-metadata-settings"],
  {
    revalidate: process.env.NODE_ENV === "development" ? 10 : 30,
    tags: ["website-metadata-settings"],
  },
);
