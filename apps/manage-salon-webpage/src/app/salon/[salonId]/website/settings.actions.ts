"use server";

import { AuthGuard } from "@/api/guards/auth.guard";
import { WebsiteAccessGuard } from "@/api/guards/website.guard";
import { GetSalonUseCase, GetSalonUseCaseLayer } from "@repo/salon-domain";
import { Effect, Option } from "effect";
import { WebsiteService, type WebsiteId } from "@repo/website-domain";
import { WebsiteLayer } from "@repo/website-domain/src/layers";

/**
 * Helper function to convert a string to a URL-friendly slug
 */
function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[äÄ]/g, "ae")
    .replace(/[öÖ]/g, "oe")
    .replace(/[üÜ]/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Server action to get initial values for the website creation form
 * Returns pre-filled values based on salon data
 */
export async function getWebsiteInitialValues(): Promise<
  | {
      success: true;
      slug: string;
      title: string;
      faviconMediaId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const authToken = await AuthGuard.getAuthToken();

  if (!authToken) {
    return { success: false, error: "Ungültige Sitzung" };
  }

  if (!authToken.salonId) {
    return { success: false, error: "Kein Salon zugeordnet" };
  }

  const salonResult = await Effect.runPromise(
    Effect.gen(function* () {
      const salon = yield* GetSalonUseCase.execute({
        salonId: authToken.salonId,
      });
      return { success: true as const, data: salon };
    }).pipe(
      Effect.catchTags({
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon nicht gefunden",
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon konnte nicht geladen werden",
          }),
      }),
      Effect.provide(GetSalonUseCaseLayer),
    ),
  );

  if (!salonResult.success) {
    return { success: false, error: "Salon nicht gefunden" };
  }

  const salon = salonResult.data;

  return {
    success: true,
    slug: slugify(salon.name),
    title: `${salon.name} - Dein Salon`,
    faviconMediaId: "",
  };
}

/**
 * Server action to get the current website settings
 * @param websiteId - ID of the website
 * @returns Current website settings or error
 */
export async function getWebsiteSettings(websiteId: string): Promise<
  | {
      success: true;
      slug: string;
      title: string;
      faviconMediaId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const canAccess = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!canAccess.success) {
    return { success: false, error: canAccess.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const service = yield* WebsiteService;
      const settings = yield* service.getWebsiteSettingsById(
        websiteId as WebsiteId,
      );

      return {
        success: true as const,
        slug: settings.slug,
        title: settings.title,
        faviconMediaId: Option.getOrElse(settings.faviconMediaId, () => ""),
      };
    }).pipe(
      Effect.catchTags({
        WebsiteNotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Website nicht gefunden",
          }),
        WebsiteDatabaseError: (error) =>
          Effect.gen(function* () {
            yield* Effect.logError(
              `Database error fetching website settings: ${error.message}`,
            );
            return {
              success: false as const,
              error: "Fehler beim Laden der Einstellungen",
            };
          }),
      }),
      Effect.provide(WebsiteLayer),
    ),
  );
}

/**
 * Server action to create a new website with custom settings
 * @param slug - URL slug for the website
 * @param title - Page title for browser tabs and SEO
 * @param faviconMediaId - Optional media ID of the favicon image managed by the salon media system
 * @returns Result with the created website ID or error
 */
export async function createWebsite(
  slug: string,
  title: string,
  faviconMediaId: string,
): Promise<
  | {
      success: true;
      websiteId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const authToken = await AuthGuard.getAuthToken();

  if (!authToken) {
    return { success: false, error: "Ungültige Sitzung" };
  }

  if (!authToken.salonId) {
    return { success: false, error: "Kein Salon zugeordnet" };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const service = yield* WebsiteService;
      return yield* service
        .createWebsite({
          salonId: authToken.salonId,
          slug,
          title,
          faviconMediaId: faviconMediaId
            ? Option.some(faviconMediaId)
            : Option.none<string>(),
        })
        .pipe(
          Effect.map((websiteId) => ({ websiteId, success: true as const })),
        );
    }).pipe(
      Effect.catchTag("WebsiteAlreadyExistsError", (error) => {
        if (error.slug) {
          return Effect.succeed({
            success: false as const,
            error: "Dieser Slug wird bereits verwendet",
          });
        }
        return Effect.succeed({
          success: false as const,
          error: "Für diesen Salon existiert bereits eine Website",
        });
      }),

      Effect.provide(WebsiteLayer),
    ),
  );
}

/**
 * Server action to update website settings
 * @param websiteId - ID of the website to update
 * @param slug - URL slug for the website
 * @param title - Page title for browser tabs and SEO
 * @param faviconMediaId - Optional URL to favicon image
 * @returns Result indicating success or error
 */
export async function updateWebsiteSettings(
  websiteId: string,
  slug: string,
  title: string,
  faviconMediaId: string,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  const canAccess = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!canAccess.success) {
    return { success: false, error: canAccess.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const service = yield* WebsiteService;
      yield* service.updateWebsiteSettings(websiteId as WebsiteId, {
        slug,
        title,
        faviconMediaId: faviconMediaId
          ? Option.some(faviconMediaId)
          : Option.none(),
      });
      return { success: true as const };
    }).pipe(
      Effect.catchTag("WebsiteAlreadyExistsError", (error) => {
        if (error.slug) {
          return Effect.succeed({
            success: false as const,
            error: "Dieser Slug wird bereits verwendet",
          });
        }
        return Effect.succeed({
          success: false as const,
          error: "Fehler beim Aktualisieren der Einstellungen",
        });
      }),
      Effect.catchAll((error) => {
        console.error("Error updating website settings:", error);
        return Effect.succeed({
          success: false as const,
          error: "Fehler beim Aktualisieren der Einstellungen",
        });
      }),
      Effect.provide(WebsiteLayer),
    ),
  );
}
