import { Context, Effect, Layer } from "effect";
import { db, sectionsTable } from "../index";
import { eq, and } from "drizzle-orm";
import { AllSections, SectionType } from "./types";
import { GallerySectionRepository } from "./gallery-section-repository";
import { TextWithImageSectionRepository } from "./text-with-image-section-repository";
import { CenterTextSectionRepository } from "./center-text-section-repository";
import { ReasonSectionRepository } from "./reason-section-repository";
import { BaseSectionRepository } from "./base-section-repository";
import {
  SectionNotFoundError,
  InvalidSectionTypeError,
  SectionCreateError,
  SectionUpdateError,
  SectionDeleteError,
  SectionFetchError,
  SectionReorderError,
} from "./errors";

/**
 * Effect service for managing website sections.
 */
export interface SectionRepository {
  /**
   * Create a new section for a website.
   * @param websiteId Website id to create the section for.
   * @param type Section type to create.
   * @param position Position/order of the section.
   * @returns Effect that resolves to the created section.
   */
  createSection(
    websiteId: string,
    type: SectionType,
    position: number,
  ): Effect.Effect<
    AllSections,
    InvalidSectionTypeError | SectionCreateError | Error,
    never
  >;

  /**
   * Update an existing section.
   * @param section Section data to update.
   * @returns Effect that resolves when update completes.
   */
  updateSection(
    section: AllSections,
  ): Effect.Effect<
    void,
    InvalidSectionTypeError | SectionUpdateError | SectionNotFoundError | Error,
    never
  >;

  /**
   * Delete a section.
   * @param websiteId Website id owning the section.
   * @param id Section id to delete.
   * @returns Effect that resolves when deletion completes.
   */
  deleteSection(
    websiteId: string,
    id: string,
  ): Effect.Effect<void, SectionDeleteError | Error, never>;

  /**
   * Reorder sections for a website.
   * @param websiteId Website id owning the sections.
   * @param sectionIds Array of section ids in new order.
   * @returns Effect that resolves when reordering completes.
   */
  reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Effect.Effect<void, SectionReorderError | Error, never>;

  /**
   * Fetch all sections for a website.
   * @param websiteId Website id to fetch sections for.
   * @returns Effect that resolves to array of sections.
   */
  fetchSections(
    websiteId: string,
  ): Effect.Effect<AllSections[], SectionFetchError | Error, never>;
}

/**
 * Context tag for the SectionRepository service.
 */
export const SectionRepository = Context.GenericTag<SectionRepository>(
  "@repo/website-database/SectionRepository",
);

const genSectionRepositoryLive: Effect.Effect<SectionRepository> =
  Effect.gen(function* () {
    yield* Effect.log("Initializing SectionRepositoryLive");

    const baseRepo = new BaseSectionRepository();
    const gallerySectionRepo = new GallerySectionRepository(baseRepo);
    const textWithImageSectionRepo = new TextWithImageSectionRepository(baseRepo);
    const centerTextSectionRepo = new CenterTextSectionRepository(baseRepo);
    const reasonSectionRepo = new ReasonSectionRepository(baseRepo);

    const repositoryMap: Record<
      SectionType,
      | GallerySectionRepository
      | TextWithImageSectionRepository
      | CenterTextSectionRepository
      | ReasonSectionRepository
    > = {
      gallery: gallerySectionRepo,
      "text-with-image": textWithImageSectionRepo,
      "center-text": centerTextSectionRepo,
      reason: reasonSectionRepo,
    };

    const getRepositoryForType = (
      type: SectionType,
    ): Effect.Effect<
      | GallerySectionRepository
      | TextWithImageSectionRepository
      | CenterTextSectionRepository
      | ReasonSectionRepository,
      InvalidSectionTypeError,
      never
    > =>
      Effect.gen(function* () {
        const repository = repositoryMap[type];
        if (!repository) {
          return yield* Effect.fail(
            new InvalidSectionTypeError({ sectionType: type }),
          );
        }
        return repository;
      });

    const createSection: SectionRepository["createSection"] = (
      websiteId,
      type,
      position,
    ) =>
      Effect.gen(function* () {
        const repository = yield* getRepositoryForType(type);
        
        const result = yield* Effect.promise(() =>
          repository.createSection(websiteId, position),
        );

        if (!result.success) {
          return yield* Effect.fail(
            new SectionCreateError({
              websiteId,
              sectionType: type,
              message: result.errors,
            }),
          );
        }

        return result.data;
      });

    const updateSection: SectionRepository["updateSection"] = (section) =>
      Effect.gen(function* () {
        const repository = yield* getRepositoryForType(section.type);

        const result = yield* Effect.promise(() =>
          repository.updateSection(section),
        );

        if (!result.success) {
          return yield* Effect.fail(
            new SectionUpdateError({
              sectionId: section.id,
              message: result.errors,
            }),
          );
        }

        yield* Effect.log("Section updated", section.id);
      });

    const deleteSection: SectionRepository["deleteSection"] = (
      websiteId,
      id,
    ) =>
      Effect.gen(function* () {
        yield* Effect.promise(() =>
          baseRepo.deleteSectionById(id, websiteId),
        ).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new SectionDeleteError({
                sectionId: id,
                websiteId,
                message: error instanceof Error ? error.message : "Unknown error",
              }),
            ),
          ),
        );

        yield* Effect.log("Section deleted", id);
      });

    const reorderSections: SectionRepository["reorderSections"] = (
      websiteId,
      sectionIds,
    ) =>
      Effect.gen(function* () {
        yield* Effect.promise(() =>
          db.transaction(async (tx) => {
            for (let i = 0; i < sectionIds.length; i++) {
              const sectionId = sectionIds[i];
              if (!sectionId) continue;

              await tx
                .update(sectionsTable)
                .set({ order: i })
                .where(
                  and(
                    eq(sectionsTable.id, sectionId),
                    eq(sectionsTable.websiteId, websiteId),
                  ),
                );
            }
          }),
        ).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new SectionReorderError({
                websiteId,
                message: error instanceof Error ? error.message : "Unknown error",
              }),
            ),
          ),
        );

        yield* Effect.log("Sections reordered for website", websiteId);
      });

    const fetchSections: SectionRepository["fetchSections"] = (websiteId) =>
      Effect.gen(function* () {
        const dbSections = yield* Effect.promise(() =>
          db
            .select()
            .from(sectionsTable)
            .where(eq(sectionsTable.websiteId, websiteId))
            .orderBy(sectionsTable.order),
        );

        const sections: AllSections[] = [];

        for (const dbSection of dbSections) {
          const sectionResult = yield* Effect.gen(function* () {
            const repository = yield* getRepositoryForType(dbSection.type);
            const result = yield* Effect.promise(() =>
              repository.fetchSection(dbSection.id),
            );

            if (result.success) {
              return result.data;
            }
            return yield* Effect.fail(
              new SectionFetchError({
                sectionId: dbSection.id,
                websiteId,
                message: result.errors,
              }),
            );
          }).pipe(
            Effect.catchTag("InvalidSectionTypeError", (error) =>
              Effect.gen(function* () {
                yield* Effect.logError(
                  `Skipping section ${dbSection.id}: Invalid type ${error.sectionType}`,
                );
                return undefined;
              }),
            ),
            Effect.flatten,
            Effect.option,
          );

          if (sectionResult._tag === "Some") {
            sections.push(sectionResult.value);
          }
        }

        return sections;
      });

    return {
      createSection,
      updateSection,
      deleteSection,
      reorderSections,
      fetchSections,
    };
  });

/**
 * Live service layer for SectionRepository.
 */
export const SectionRepositoryLive = Layer.effect(
  SectionRepository,
  genSectionRepositoryLive,
);

/**
 * Legacy factory function for non-Effect consumers.
 * @deprecated Use SectionRepository Effect service instead.
 */
export const sectionRepository = () => {
  const baseRepo = new BaseSectionRepository();
  
  return {
    async createSection(websiteId: string, type: SectionType, position: number) {
      const repo = await Effect.runPromise(
        Effect.gen(function* () {
          return yield* SectionRepository;
        }).pipe(Effect.provide(SectionRepositoryLive))
      );
      
      return await Effect.runPromise(
        repo.createSection(websiteId, type, position).pipe(
          Effect.map((data) => ({ success: true as const, data })),
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false as const,
              errors: error instanceof Error ? error.message : "Unknown error",
            }),
          ),
        ),
      );
    },
    
    async updateSection(section: AllSections) {
      const repo = await Effect.runPromise(
        Effect.gen(function* () {
          return yield* SectionRepository;
        }).pipe(Effect.provide(SectionRepositoryLive))
      );
      
      return await Effect.runPromise(
        repo.updateSection(section).pipe(
          Effect.map(() => ({ success: true as const, data: undefined as void })),
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false as const,
              errors: error instanceof Error ? error.message : "Unknown error",
            }),
          ),
        ),
      );
    },
    
    async deleteSection(websiteId: string, id: string) {
      const repo = await Effect.runPromise(
        Effect.gen(function* () {
          return yield* SectionRepository;
        }).pipe(Effect.provide(SectionRepositoryLive))
      );
      
      return await Effect.runPromise(
        repo.deleteSection(websiteId, id).pipe(
          Effect.map(() => ({ success: true as const, data: undefined as void })),
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false as const,
              errors: error instanceof Error ? error.message : "Unknown error",
            }),
          ),
        ),
      );
    },
    
    async reorderSections(websiteId: string, sectionIds: string[]) {
      const repo = await Effect.runPromise(
        Effect.gen(function* () {
          return yield* SectionRepository;
        }).pipe(Effect.provide(SectionRepositoryLive))
      );
      
      return await Effect.runPromise(
        repo.reorderSections(websiteId, sectionIds).pipe(
          Effect.map(() => ({ success: true as const, data: undefined as void })),
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false as const,
              errors: error instanceof Error ? error.message : "Unknown error",
            }),
          ),
        ),
      );
    },
    
    async fetchSections(websiteId: string) {
      const repo = await Effect.runPromise(
        Effect.gen(function* () {
          return yield* SectionRepository;
        }).pipe(Effect.provide(SectionRepositoryLive))
      );
      
      return await Effect.runPromise(
        repo.fetchSections(websiteId).pipe(
          Effect.map((data) => ({ success: true as const, data })),
          Effect.catchAll((error) =>
            Effect.succeed({
              success: false as const,
              errors: error instanceof Error ? error.message : "Unknown error",
            }),
          ),
        ),
      );
    },
  };
};
