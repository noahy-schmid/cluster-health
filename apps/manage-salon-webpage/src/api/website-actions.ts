"use server";

import { WebsiteAccessGuard } from "@/api/guards/website-access-guard";
import { db, websitesTable } from "@repo/website-database";
import { eq } from "drizzle-orm";
import { Effect } from "effect";
import { cookies } from "next/headers";
import { ManagementUserRepository } from "@repo/auth-domain";

import {
  WebsiteHeroRepository,
  WebsiteHeroRepositoryLive,
  HeroSettings,
} from "@repo/website-database";
import { redirect, RedirectType } from "next/navigation";

/**
 * Server action to create a new website
 * Returns the created website ID
 */
export async function createWebsite(): Promise<
  | {
      success: true;
      websiteId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const session = (await cookies()).get("session");
  if (!session?.value) {
    return { success: false, error: "Sitzung abgelaufen" };
  }

  const authRepository = new ManagementUserRepository();
  const authResult = await authRepository.authenticateToken(session.value);

  if (!authResult.success) {
    return { success: false, error: "Ungültige Sitzung" };
  }

  if (!authResult.data.salonId) {
    return { success: false, error: "Kein Salon zugeordnet" };
  }

  const [existingWebsite] = await db
    .select({ id: websitesTable.id })
    .from(websitesTable)
    .where(eq(websitesTable.salonId, authResult.data.salonId));

  if (existingWebsite) {
    return { success: false, error: "Website already exists" };
  }

  const newWebsite: typeof websitesTable.$inferInsert = {
    salonId: authResult.data.salonId,
    heroImage: "",
    logo: "",
    slug: `salon-${Date.now()}`,
    title: "Meine Salon Webseite",
    subtitle: "Willkommen auf meiner Salon Webseite",
    colorBackgroundBase: "#FAF8F6",
    colorBackgroundElevation1: "#FFFFFF",
    colorBackgroundElevation2: "#F5F3F1",
    colorForegroundBase: "#1A1A1A",
    colorForegroundMuted: "#6B6B6B",
    colorForegroundStrong: "#000000",
    colorAccent: "#B8845F",
    colorOnAccent: "#FFFFFF",
  };

  try {
    const insertedWebsite = await db
      .insert(websitesTable)
      .values(newWebsite)
      .returning();
    return { success: true, websiteId: insertedWebsite[0].id };
  } catch (error) {
    console.error("Error creating website:", error);
    return {
      success: false,
      error: "Failed to create website",
    };
  }
}

export async function getWebsiteSlug(websiteId: string): Promise<
  | {
      success: true;
      slug: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  try {
    const [website] = await db
      .select({ slug: websitesTable.slug })
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId))
      .limit(1);

    if (!website) {
      return {
        success: false,
        error: "Website not found",
      };
    }

    return {
      success: true,
      slug: website.slug,
    };
  } catch (error) {
    console.error("Error fetching website slug:", error);
    return {
      success: false,
      error: "Failed to fetch website slug",
    };
  }
}

/**
 * Looks up the website for a salon that belongs to the current user.
 * Returns the website ID if it exists.
 */
export async function getWebsiteIdForSalon(
  salonId: string,
): Promise<
  { success: true; websiteId?: string } | { success: false; error: string }
> {
  const session = (await cookies()).get("session");
  if (!session?.value) {
    return { success: false, error: "Sitzung abgelaufen" };
  }

  const authRepository = new ManagementUserRepository();
  const authResult = await authRepository.authenticateToken(session.value);

  if (!authResult.success) {
    return { success: false, error: "Ungultige Sitzung" };
  }

  if (!authResult.data.salonId || authResult.data.salonId !== salonId) {
    return { success: false, error: "Kein Zugriff auf diesen Salon" };
  }

  const [existingWebsite] = await db
    .select({ id: websitesTable.id })
    .from(websitesTable)
    .where(eq(websitesTable.salonId, salonId));

  return { success: true, websiteId: existingWebsite?.id };
}

export async function getHeroSettings(websiteId: string): Promise<
  | {
      success: true;
      settings: HeroSettings;
    }
  | {
      success: false;
      error: string;
    }
> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const repository = yield* WebsiteHeroRepository;
    return yield* repository.fetchHeroSettings(websiteId).pipe(
      Effect.map((settings) => ({
        success: true as const,
        settings,
      })),
      Effect.catchTags({
        WebsiteHeroInvalidTextColorError: () =>
          Effect.succeed({
            success: false as const,
            error: "Invalid hero text color",
          }),
        WebsiteHeroNotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Website not found",
          }),
      }),
    );
  });

  return await Effect.runPromise(
    Effect.provide(program, WebsiteHeroRepositoryLive),
  );
}

export async function updateHeroSettings(
  websiteId: string,
  settings: HeroSettings,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const repository = yield* WebsiteHeroRepository;
    return yield* repository.updateHeroSettings(websiteId, settings).pipe(
      Effect.map(() => ({ success: true as const })),
      Effect.catchTags({
        WebsiteHeroNotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Website not found",
          }),
      }),
      Effect.catchAll((error) => {
        console.error("Error updating hero settings:", error);
        return Effect.succeed({
          success: false as const,
          error: "Failed to update hero settings",
        });
      }),
    );
  });

  return await Effect.runPromise(
    Effect.provide(program, WebsiteHeroRepositoryLive),
  );
}

export interface ColorSettings {
  backgroundBase: string;
  foregroundBase: string;
  accent: string;
}

export interface AllColorSettings extends ColorSettings {
  backgroundElevation1: string;
  backgroundElevation2: string;
  foregroundMuted: string;
  foregroundStrong: string;
  onAccent: string;
}

/**
 * Server action to get color settings for a website
 * Returns only the base colors (backgroundBase, foregroundBase, accent)
 */
export async function getColorSettings(websiteId: string): Promise<
  | {
      success: true;
      colors: ColorSettings;
    }
  | {
      success: false;
      error: string;
    }
> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  try {
    const [website] = await db
      .select({
        colorBackgroundBase: websitesTable.colorBackgroundBase,
        colorForegroundBase: websitesTable.colorForegroundBase,
        colorAccent: websitesTable.colorAccent,
      })
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId))
      .limit(1);

    if (!website) {
      return {
        success: false,
        error: "Website not found",
      };
    }

    return {
      success: true,
      colors: {
        backgroundBase: website.colorBackgroundBase,
        foregroundBase: website.colorForegroundBase,
        accent: website.colorAccent,
      },
    };
  } catch (error) {
    console.error("Error fetching color settings:", error);
    return {
      success: false,
      error: "Failed to fetch color settings",
    };
  }
}

/**
 * Server action to update all color settings for a website
 * Accepts both base colors and computed/derived colors
 */
export async function updateColorSettings(
  websiteId: string,
  colors: AllColorSettings,
): Promise<
  | {
      success: true;
    }
  | {
      success: false;
      error: string;
    }
> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  try {
    await db
      .update(websitesTable)
      .set({
        colorBackgroundBase: colors.backgroundBase,
        colorBackgroundElevation1: colors.backgroundElevation1,
        colorBackgroundElevation2: colors.backgroundElevation2,
        colorForegroundBase: colors.foregroundBase,
        colorForegroundMuted: colors.foregroundMuted,
        colorForegroundStrong: colors.foregroundStrong,
        colorAccent: colors.accent,
        colorOnAccent: colors.onAccent,
      })
      .where(eq(websitesTable.id, websiteId));

    return { success: true };
  } catch (error) {
    console.error("Error updating color settings:", error);
    return {
      success: false,
      error: "Failed to update color settings",
    };
  }
}

export async function openWebsite(websiteId: string) {
  const slugResult = await getWebsiteSlug(websiteId);

  if (!slugResult.success) {
    console.error("Error fetching website slug:", slugResult.error);
    return;
  }

  redirect(`http://localhost:3001/salon/${slugResult.slug}`, RedirectType.replace);
}
