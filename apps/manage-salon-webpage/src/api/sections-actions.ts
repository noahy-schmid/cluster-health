"use server";

import {
  SectionType,
  AllSections,
  SectionRepository,
  SectionRepositoryLive,
  Result,
} from "@repo/website-database";
import { WebsiteAccessGuard } from "@/api/guards/website.guard";
import { Effect } from "effect";

/**
 * Server action to create a new section
 * Takes websiteId, type and position, returns the created section with generated ID
 */
export async function createSection(
  websiteId: string,
  type: SectionType,
  position: number,
): Promise<Result<AllSections, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const createEffect = Effect.gen(function* () {
    const repo = yield* SectionRepository;
    return yield* repo.createSection(websiteId, type, position).pipe(
      Effect.map((data) => ({ success: true as const, data })),
      Effect.catchTag("InvalidSectionTypeError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `Invalid section type: ${error.sectionType}`,
        }),
      ),
      Effect.catchTag("SectionError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message || "Failed to create section",
        }),
      ),
    );
  }).pipe(Effect.provide(SectionRepositoryLive));

  return await Effect.runPromise(createEffect);
}

/**
 * Server action to update an existing section
 */
export async function updateSection(
  websiteId: string,
  section: AllSections,
): Promise<Result<void, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const updateEffect = Effect.gen(function* () {
    const repo = yield* SectionRepository;

    // Ensure the section being updated actually belongs to the given website
    const fetchResult = yield* repo.fetchSections(websiteId).pipe(
      Effect.catchAll((error) =>
        Effect.fail({
          success: false as const,
          errors:
            error instanceof Error
              ? error.message
              : "Failed to load sections for update",
        }),
      ),
    );

    const ownsSection = fetchResult.some(
      (existingSection) => existingSection.id === section.id,
    );

    if (!ownsSection) {
      return yield* Effect.fail({
        success: false as const,
        errors: "Section does not belong to this website",
      });
    }

    return yield* repo.updateSection(section).pipe(
      Effect.map(() => ({ success: true as const, data: undefined as void })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors: error instanceof Error ? error.message : "Unknown error",
        }),
      ),
    );
  }).pipe(
    Effect.provide(SectionRepositoryLive),
    Effect.catchAll((error) => Effect.succeed(error)),
  );

  return await Effect.runPromise(updateEffect);
}

/**
 * Server action to delete a section
 */
export async function deleteSection(
  websiteId: string,
  id: string,
): Promise<Result<void, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const deleteEffect = Effect.gen(function* () {
    const repo = yield* SectionRepository;
    return yield* repo.deleteSection(websiteId, id).pipe(
      Effect.map(() => ({ success: true as const, data: undefined as void })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors: error instanceof Error ? error.message : "Unknown error",
        }),
      ),
    );
  }).pipe(Effect.provide(SectionRepositoryLive));

  return await Effect.runPromise(deleteEffect);
}

/**
 * Server action to reorder sections
 * Takes websiteId and array of section IDs in their new order
 */
export async function reorderSections(
  websiteId: string,
  sectionIds: string[],
): Promise<Result<void, string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const reorderEffect = Effect.gen(function* () {
    const repo = yield* SectionRepository;
    return yield* repo.reorderSections(websiteId, sectionIds).pipe(
      Effect.map(() => ({ success: true as const, data: undefined as void })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors: `${error.name}: ${error.message}`,
        }),
      ),
    );
  }).pipe(Effect.provide(SectionRepositoryLive));

  return await Effect.runPromise(reorderEffect);
}

/**
 * Server action to fetch all sections for a website
 */
export async function fetchSections(
  websiteId: string,
): Promise<Result<AllSections[], string>> {
  const guard = new WebsiteAccessGuard();
  const access = await guard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const fetchEffect = Effect.gen(function* () {
    const repo = yield* SectionRepository;
    return yield* repo.fetchSections(websiteId).pipe(
      Effect.tap((sections) =>
        Effect.log(
          `Fetched sections for website ${websiteId}: ${JSON.stringify(sections)}`,
        ),
      ),
      Effect.map((data) => ({ success: true as const, data })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors: `${error.name}: ${error.message}`,
        }),
      ),
    );
  }).pipe(Effect.provide(SectionRepositoryLive));

  return await Effect.runPromise(fetchEffect);
}
