"use server";

import {
  HeroSettings,
  WebsiteHeroRepository,
  WebsiteHeroRepositoryLive,
} from "@repo/website-database";
import { Effect } from "effect";

/**
 * Server action to fetch hero settings for a salon by its slug
 */
export async function fetchHeroSettingsBySalonSlug(salonSlug: string): Promise<{
  success: boolean;
  settings?: HeroSettings;
  error?: string;
}> {
  const fetchEffect = Effect.gen(function* () {
    const repo = yield* WebsiteHeroRepository;
    return yield* repo.fetchHeroSettingsBySalonSlug(salonSlug).pipe(
      Effect.map((settings) => ({ success: true, settings })),
      Effect.catchTag("WebsiteHeroNotFoundError", () =>
        Effect.succeed({ success: false, error: "Website not found" }),
      ),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false,
          error: error instanceof Error ? error.message : "Unknown error",
        }),
      ),
    );
  }).pipe(Effect.provide(WebsiteHeroRepositoryLive));

  return await Effect.runPromise(fetchEffect);
}
