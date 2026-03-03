"use server";

import {
  WebsiteHeroRepository,
  WebsiteHeroRepositoryLive,
} from "@repo/website-domain";
import { MediaService, MediaLayer } from "@repo/salon-domain";
import { Effect } from "effect";
import { unstable_cache } from "next/cache";

export interface HeroSettingsWithUrls {
  heroImageUrl: string | null;
  logoUrl: string | null;
  title: string;
  subtitle: string;
  textColor: "light" | "dark";
}

/**
 * Server action to fetch hero settings for a salon by its slug
 */
export const fetchHeroSettingsBySalonSlug = unstable_cache(
  async (
    salonSlug: string,
  ): Promise<{
    success: boolean;
    settings?: HeroSettingsWithUrls;
    error?: string;
  }> => {
    const fetchEffect = Effect.gen(function* () {
      const heroRepo = yield* WebsiteHeroRepository;
      const mediaService = yield* MediaService;

      const heroSettings = yield* heroRepo
        .fetchHeroSettingsBySalonSlug(salonSlug)
        .pipe(
          Effect.map((settings) => settings),
          Effect.catchTag("WebsiteHeroNotFoundError", () =>
            Effect.succeed(null),
          ),
        );

      if (!heroSettings) {
        return { success: false, error: "Website not found" };
      }

      const heroImageUrl = yield* heroSettings.heroImage
        ? mediaService.getMediaUrl(heroSettings.heroImage).pipe(
            Effect.map((url) => url as string | null),
            Effect.catchAll(() => Effect.succeed(null)),
          )
        : Effect.succeed(null);

      const logoUrl = yield* heroSettings.logo
        ? mediaService.getMediaUrl(heroSettings.logo).pipe(
            Effect.map((url) => url as string | null),
            Effect.catchAll(() => Effect.succeed(null)),
          )
        : Effect.succeed(null);

      return {
        success: true,
        settings: {
          heroImageUrl,
          logoUrl,
          title: heroSettings.title,
          subtitle: heroSettings.subtitle,
          textColor: heroSettings.textColor,
        },
      };
    }).pipe(
      Effect.provide(WebsiteHeroRepositoryLive),
      Effect.provide(MediaLayer),
    );

    return await Effect.runPromise(fetchEffect);
  },
  ["hero-settings"],
  {
    revalidate: process.env.NODE_ENV === "development" ? 10 : 30,
    tags: ["hero-settings"],
  },
);
