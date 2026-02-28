"use server";

import {
  type SectionType,
  type AllSections,
  type Result,
  CreateSectionUseCase,
  CreateSectionUseCaseLayer,
  UpdateSectionUseCase,
  UpdateSectionUseCaseLayer,
  DeleteSectionUseCase,
  DeleteSectionUseCaseLayer,
  ReorderSectionsUseCase,
  ReorderSectionsUseCaseLayer,
  ListSectionsUseCase,
  ListSectionsUseCaseLayer,
} from "@repo/website-database";
import { WebsiteAccessGuard } from "@/api/guards/website.guard";
import { Effect, Layer } from "effect";

/**
 * Server action to create a new section
 * Takes websiteId, type and position, returns the created section with generated ID
 */
export async function createSection(
  websiteId: string,
  type: SectionType,
  position: number,
): Promise<Result<AllSections, string>> {
  const access = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* CreateSectionUseCase;
    return yield* useCase.execute({ websiteId, type, position }).pipe(
      Effect.map((data) => ({ success: true as const, data })),
      Effect.catchTag("InvalidSectionTypeError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `Invalid section type: ${error.sectionType}`,
        }),
      ),
      Effect.catchTag("SectionNotFoundError", () =>
        Effect.succeed({
          success: false as const,
          errors: "Website not found",
        }),
      ),
      Effect.catchTag("SectionError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message || "Failed to create section",
        }),
      ),
    );
  }).pipe(Effect.provide(CreateSectionUseCaseLayer));

  return await Effect.runPromise(program);
}

/**
 * Server action to update an existing section
 */
export async function updateSection(
  websiteId: string,
  section: AllSections,
): Promise<Result<void, string>> {
  const access = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const program = Effect.gen(function* () {
    const listUseCase = yield* ListSectionsUseCase;
    const updateUseCase = yield* UpdateSectionUseCase;

    // Ensure the section being updated actually belongs to the given website
    const fetchResult = yield* listUseCase.execute({ websiteId }).pipe(
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

    return yield* updateUseCase.execute(section).pipe(
      Effect.map(() => ({ success: true as const, data: undefined })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors: error instanceof Error ? error.message : "Unknown error",
        }),
      ),
    );
  }).pipe(
    Effect.provide(
      Layer.merge(UpdateSectionUseCaseLayer, ListSectionsUseCaseLayer),
    ),
    Effect.catchAll((error) => Effect.succeed(error)),
  );

  return await Effect.runPromise(program);
}

/**
 * Server action to delete a section
 */
export async function deleteSection(
  websiteId: string,
  id: string,
): Promise<Result<void, string>> {
  const access = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* DeleteSectionUseCase;
    return yield* useCase.execute({ websiteId, sectionId: id }).pipe(
      Effect.map(() => ({ success: true as const, data: undefined })),
      Effect.catchAll((error) =>
        Effect.succeed({
          success: false as const,
          errors: error instanceof Error ? error.message : "Unknown error",
        }),
      ),
    );
  }).pipe(Effect.provide(DeleteSectionUseCaseLayer));

  return await Effect.runPromise(program);
}

/**
 * Server action to reorder sections
 * Takes websiteId and array of section IDs in their new order
 */
export async function reorderSections(
  websiteId: string,
  sectionIds: string[],
): Promise<Result<void, string>> {
  const access = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* ReorderSectionsUseCase;
    return yield* useCase.execute({ websiteId, sectionIds }).pipe(
      Effect.map(() => ({ success: true as const, data: undefined })),
      Effect.catchTag("SectionError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `${error._tag}: ${error.message}`,
        }),
      ),
    );
  }).pipe(Effect.provide(ReorderSectionsUseCaseLayer));

  return await Effect.runPromise(program);
}

/**
 * Server action to fetch all sections for a website
 */
export async function fetchSections(
  websiteId: string,
): Promise<Result<AllSections[], string>> {
  const access = await WebsiteAccessGuard.canEditWebsite(websiteId);

  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const program = Effect.gen(function* () {
    const useCase = yield* ListSectionsUseCase;
    return yield* useCase.execute({ websiteId }).pipe(
      Effect.tap((sections) =>
        Effect.log(
          `Fetched sections for website ${websiteId}: ${JSON.stringify(sections)}`,
        ),
      ),
      Effect.map((data) => ({ success: true as const, data })),
      Effect.catchTag("SectionError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `${error._tag}: ${error.message}`,
        }),
      ),
    );
  }).pipe(Effect.provide(ListSectionsUseCaseLayer));

  return await Effect.runPromise(program);
}
