"use server";

import {
  HeroSettings,
  WebsiteHeroRepository,
  WebsiteHeroRepositoryLive,
} from "@repo/website-database";
import { Effect } from "effect";
import { unstable_cache } from "next/cache";

/**
 * Server action to fetch hero settings for a salon by its slug
 */
export const fetchHeroSettingsBySalonSlug = unstable_cache(
  async (
    salonSlug: string,
  ): Promise<{
    success: boolean;
    settings?: HeroSettings;
    error?: string;
  }> => {
    const fetchEffect = Effect.gen(function* () {
      const repo = yield* WebsiteHeroRepository;
      return yield* repo.fetchHeroSettingsBySalonSlug(salonSlug).pipe(
        Effect.map((settings) => ({ success: true, settings })),
        Effect.catchTag("WebsiteHeroNotFoundError", () =>
          Effect.succeed({ success: false, error: "Website not found" }),
        ),
        Effect.catchAll((error) =>
          Effect.logError(
            "Error fetching hero settings",
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
    }).pipe(Effect.provide(WebsiteHeroRepositoryLive));

    return await Effect.runPromise(fetchEffect);
  },
  ["hero-settings"],
  {
    revalidate: process.env.NODE_ENV === "development" ? 10 : 30,
    tags: ["hero-settings"],
  },
);
