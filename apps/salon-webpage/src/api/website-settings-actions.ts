"use server";

import { WebsiteService, WebsiteLayer } from "@repo/website-domain";
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
      menuBarTitle: string | null;
      menuLogoPosition: "left" | "center";
    };
    error?: string;
  }> => {
    const fetchEffect = Effect.gen(function* () {
      const service = yield* WebsiteService;
      return yield* service.getWebsiteSettingsBySlug(salonSlug).pipe(
        Effect.map((settings) => ({
          success: true,
          settings: {
            title: settings.title,
            favicon: Option.getOrNull(settings.favicon),
            menuBarTitle: Option.getOrNull(settings.menuBarTitle),
            menuLogoPosition: settings.menuLogoPosition,
          },
        })),
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
    }).pipe(Effect.provide(WebsiteLayer));

    return await Effect.runPromise(fetchEffect);
  },
  ["website-metadata-settings"],
  {
    revalidate: process.env.NODE_ENV === "development" ? 10 : 30,
    tags: ["website-metadata-settings"],
  },
);
