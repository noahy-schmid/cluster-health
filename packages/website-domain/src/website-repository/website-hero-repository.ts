import { Context, Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { websitesTable } from "../schema";
import {
  WebsiteHeroInvalidTextColorError,
  WebsiteHeroNotFoundError,
} from "./errors";

/**
 * Allowed text color values for the hero area.
 */
export type HeroTextColor = "light" | "dark";

/**
 * Website hero settings persisted in the database.
 */
export interface HeroSettings {
  heroImage: string;
  logo: string;
  title: string;
  subtitle: string;
  textColor: HeroTextColor;
}

/**
 * Effect service for reading/updating website hero settings.
 */
export interface WebsiteHeroRepository {
  /**
   * Fetch hero settings for the given website.
   * @param websiteId Website id owning the hero settings.
   * @returns Effect that resolves to the hero settings.
   */
  fetchHeroSettings(
    websiteId: string,
  ): Effect.Effect<
    HeroSettings,
    WebsiteHeroNotFoundError | WebsiteHeroInvalidTextColorError | Error,
    never
  >;

  fetchHeroSettingsBySalonSlug(
    salonSlug: string,
  ): Effect.Effect<
    HeroSettings,
    WebsiteHeroNotFoundError | WebsiteHeroInvalidTextColorError | Error,
    never
  >;

  /**
   * Update hero settings for the given website.
   * @param websiteId Website id owning the hero settings.
   * @param settings New hero settings to persist.
   * @returns Effect that resolves when update completes.
   */
  updateHeroSettings(
    websiteId: string,
    settings: HeroSettings,
  ): Effect.Effect<void, WebsiteHeroNotFoundError | Error, never>;
}

/**
 * Context tag for the WebsiteHeroRepository service.
 */
export const WebsiteHeroRepository = Context.GenericTag<WebsiteHeroRepository>(
  "@repo/website-domain/WebsiteHeroRepository",
);

const genWebsiteHeroRepositoryLive: Effect.Effect<WebsiteHeroRepository> =
  Effect.gen(function* () {
    const mapRowToSettings = (
      websiteId?: string,
      row?: {
        heroImage: string;
        logo: string;
        title: string;
        subtitle: string;
        textColor: string;
      },
    ): Effect.Effect<
      HeroSettings,
      WebsiteHeroInvalidTextColorError | WebsiteHeroNotFoundError,
      never
    > =>
      Effect.gen(function* () {
        if (!row) {
          return yield* Effect.fail(
            new WebsiteHeroNotFoundError({ websiteId }),
          );
        }

        const textColor = row.textColor;
        if (textColor !== "light" && textColor !== "dark") {
          return yield* Effect.fail(
            new WebsiteHeroInvalidTextColorError({
              websiteId,
              textColor,
            }),
          );
        }

        return {
          ...row,
          textColor,
        };
      });

    const fetchHeroSettings: WebsiteHeroRepository["fetchHeroSettings"] = (
      websiteId,
    ) =>
      Effect.gen(function* () {
        const [row] = yield* Effect.promise(async () => {
          return await db
            .select({
              heroImage: websitesTable.heroImage,
              logo: websitesTable.logo,
              title: websitesTable.heroTitle,
              subtitle: websitesTable.subtitle,
              textColor: websitesTable.textColor,
            })
            .from(websitesTable)
            .where(eq(websitesTable.id, websiteId));
        });

        return yield* mapRowToSettings(websiteId, row);
      });

    const fetchHeroSettingsBySalonSlug: WebsiteHeroRepository["fetchHeroSettingsBySalonSlug"] =
      (salonSlug) =>
        Effect.gen(function* () {
          const [row] = yield* Effect.promise(async () => {
            return await db
              .select({
                heroImage: websitesTable.heroImage,
                logo: websitesTable.logo,
                title: websitesTable.heroTitle,
                subtitle: websitesTable.subtitle,
                textColor: websitesTable.textColor,
              })
              .from(websitesTable)
              .where(eq(websitesTable.slug, salonSlug))
              .limit(1);
          });
          return yield* mapRowToSettings(undefined, row);
        });

    const updateHeroSettings: WebsiteHeroRepository["updateHeroSettings"] = (
      websiteId,
      settings,
    ) =>
      Effect.gen(function* () {
        const dbResult = yield* Effect.promise(async () => {
          const result = await db
            .update(websitesTable)
            .set({
              heroImage: settings.heroImage,
              logo: settings.logo,
              heroTitle: settings.title,
              subtitle: settings.subtitle,
              textColor: settings.textColor,
            })
            .where(eq(websitesTable.id, websiteId))
            .returning({ id: websitesTable.id });
          return result;
        });

        yield* Effect.log("Hero for website was updated", websiteId);

        if (dbResult.length === 0) {
          return yield* Effect.fail(
            new WebsiteHeroNotFoundError({ websiteId }),
          );
        }
      });

    return {
      fetchHeroSettings,
      fetchHeroSettingsBySalonSlug,
      updateHeroSettings,
    };
  });

/**
 * Live service layer for WebsiteHeroRepository.
 */
export const WebsiteHeroRepositoryLive = Layer.effect(
  WebsiteHeroRepository,
  genWebsiteHeroRepositoryLive,
);
