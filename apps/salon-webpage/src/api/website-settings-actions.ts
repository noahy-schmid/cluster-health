"use server";

import { WebsiteService, WebsiteLayer } from "@repo/website-domain";
import { MediaService, MediaLayer } from "@repo/salon-domain";
import { Effect, Option } from "effect";
import { unstable_cache } from "next/cache";

/**
 * Server action to fetch website metadata settings (title, favicon) for a salon by its slug
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
      const service = yield* WebsiteService;
      const mediaService = yield* MediaService;
      return yield* service.getWebsiteSettingsBySlug(salonSlug).pipe(
        Effect.flatMap((settings) =>
          Effect.gen(function* () {
            const faviconMediaId = Option.getOrNull(settings.favicon);

            const favicon = faviconMediaId
              ? yield* mediaService
                  .getMediaUrl(faviconMediaId)
                  .pipe(Effect.catchAll(() => Effect.succeed(null)))
              : null;

            return {
              success: true,
              settings: {
                title: settings.title,
                favicon,
              },
            };
          }),
        ),
        Effect.catchTag("WebsiteNotFoundError", () =>
          Effect.succeed({ success: false, error: "Website not found" }),
        ),
        Effect.catchAll((error) =>
          Effect.logError(
            "Error fetching website metadata settings",
            error.name,
            error,
          ).pipe(
            Effect.map(() => ({
              success: false,
              error: error instanceof Error ? error.message : "Unknown error",
            })),
          ),
        ),
      );
    }).pipe(Effect.provide(WebsiteLayer), Effect.provide(MediaLayer));

    return await Effect.runPromise(fetchEffect);
  },
  ["website-metadata-settings"],
  {
    revalidate: process.env.NODE_ENV === "development" ? 10 : 30,
    tags: ["website-metadata-settings"],
  },
);
