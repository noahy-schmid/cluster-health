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
  SectionError,
} from "./errors";
import { SectionTypeRepository } from "./section-type-repository";

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
  ): Effect.Effect<AllSections, InvalidSectionTypeError | SectionError, never>;

  /**
   * Update an existing section.
   * @param section Section data to update.
   * @returns Effect that resolves when update completes.
   */
  updateSection(
    section: AllSections,
  ): Effect.Effect<
    void,
    InvalidSectionTypeError | SectionError | SectionNotFoundError,
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
  ): Effect.Effect<void, SectionError, never>;

  /**
   * Reorder sections for a website.
   * @param websiteId Website id owning the sections.
   * @param sectionIds Array of section ids in new order.
   * @returns Effect that resolves when reordering completes.
   */
  reorderSections(
    websiteId: string,
    sectionIds: string[],
  ): Effect.Effect<void, SectionError, never>;

  /**
   * Fetch all sections for a website.
   * @param websiteId Website id to fetch sections for.
   * @returns Effect that resolves to array of sections.
   */
  fetchSections(
    websiteId: string,
  ): Effect.Effect<
    AllSections[],
    SectionError | InvalidSectionTypeError,
    never
  >;
}

/**
 * Context tag for the SectionRepository service.
 */
export const SectionRepository = Context.GenericTag<SectionRepository>(
  "@repo/website-database/SectionRepository",
);

const genSectionRepositoryLive: Effect.Effect<SectionRepository> = Effect.gen(
  function* () {
    yield* Effect.log("Initializing SectionRepositoryLive");

    const baseRepo = new BaseSectionRepository();
    const gallerySectionRepo = new GallerySectionRepository(baseRepo);
    const textWithImageSectionRepo = new TextWithImageSectionRepository(
      baseRepo,
    );
    const centerTextSectionRepo = new CenterTextSectionRepository(baseRepo);
    const reasonSectionRepo = new ReasonSectionRepository(baseRepo);

    const repositoryMap: Record<
      SectionType,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SectionTypeRepository<any>
    > = {
      gallery: gallerySectionRepo,
      "text-with-image": textWithImageSectionRepo,
      "center-text": centerTextSectionRepo,
      reason: reasonSectionRepo,
    };

    const getRepositoryForType = (
      type: SectionType,
    ): Effect.Effect<
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      SectionTypeRepository<any>,
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
            new SectionError({
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
            new SectionError({
              sectionId: section.id,
              sectionType: section.type,
              message: result.errors,
            }),
          );
        }

        yield* Effect.log("Section updated", section.id);
      });

    const deleteSection: SectionRepository["deleteSection"] = (websiteId, id) =>
      Effect.gen(function* () {
        yield* Effect.tryPromise(() =>
          baseRepo.deleteSectionById(id, websiteId),
        ).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new SectionError({
                sectionId: id,
                websiteId,
                message: `${error.name}: ${error.message}`,
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
        const sectionIdsInWebsite = yield* Effect.tryPromise(() =>
          db
            .select({ id: sectionsTable.id })
            .from(sectionsTable)
            .where(eq(sectionsTable.websiteId, websiteId)),
        ).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new SectionError({
                websiteId,
                message: `${error.name}: ${error.message}`,
              }),
            ),
          ),
        );

        if (sectionIds.length !== sectionIdsInWebsite.length) {
          return yield* Effect.fail(
            new SectionError({
              websiteId,
              message: `Provided sectionIds length (${sectionIds.length}) does not match number of sections in website (${sectionIdsInWebsite.length})`,
            }),
          );
        }

        const sectionIdsSet = new Set(sectionIds);
        if (
          !sectionIdsInWebsite.every((section) => sectionIdsSet.has(section.id))
        ) {
          return yield* Effect.fail(
            new SectionError({
              websiteId,
              message: `Provided sectionIds do not match sections in website`,
            }),
          );
        }

        yield* Effect.tryPromise(() =>
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
              new SectionError({
                websiteId,
                message: `${error.name}: ${error.message}`,
              }),
            ),
          ),
        );

        yield* Effect.log("Sections reordered for website", websiteId);
      });

    const fetchSections: SectionRepository["fetchSections"] = (websiteId) =>
      Effect.gen(function* () {
        const dbSections = yield* Effect.tryPromise(() =>
          db
            .select()
            .from(sectionsTable)
            .where(eq(sectionsTable.websiteId, websiteId))
            .orderBy(sectionsTable.order),
        ).pipe(
          Effect.catchAll((error) =>
            Effect.fail(
              new SectionError({
                websiteId,
                message: `${error.name}: ${error.message}`,
              }),
            ),
          ),
        );

        const sections: AllSections[] = yield* Effect.forEach(
          dbSections,
          (dbSection) =>
            Effect.gen(function* () {
              const repository = yield* getRepositoryForType(
                dbSection.type as SectionType,
              );
              const result = yield* Effect.tryPromise(() =>
                repository.fetchSection(dbSection.id),
              ).pipe(
                Effect.catchAll((error) =>
                  Effect.fail(
                    new SectionError({
                      sectionId: dbSection.id,
                      websiteId,
                      sectionType: dbSection.type,
                      message: `${error.name}: ${error.message}`,
                    }),
                  ),
                ),
              );
              if (!result.success) {
                return yield* Effect.fail(
                  new SectionError({
                    sectionId: dbSection.id,
                    websiteId,
                    message: result.errors,
                  }),
                );
              }
              return result.data;
            }).pipe(
              Effect.tapErrorTag("InvalidSectionTypeError", (error) =>
                Effect.logError(
                  "Found section with invalid type during fetchSections",
                  {
                    websiteId,
                    sectionId: dbSection.id,
                    sectionType: error.sectionType,
                  },
                ),
              ),
            ),
        );

        return sections;
      });

    return {
      createSection,
      updateSection,
      deleteSection,
      reorderSections,
      fetchSections,
    };
  },
);

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
  return {
    async createSection(
      websiteId: string,
      type: SectionType,
      position: number,
    ) {
      const repo = await Effect.runPromise(
        Effect.gen(function* () {
          return yield* SectionRepository;
        }).pipe(Effect.provide(SectionRepositoryLive)),
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
        }).pipe(Effect.provide(SectionRepositoryLive)),
      );

      return await Effect.runPromise(
        repo.updateSection(section).pipe(
          Effect.map(() => ({
            success: true as const,
            data: undefined as void,
          })),
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
        }).pipe(Effect.provide(SectionRepositoryLive)),
      );

      return await Effect.runPromise(
        repo.deleteSection(websiteId, id).pipe(
          Effect.map(() => ({
            success: true as const,
            data: undefined as void,
          })),
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
        }).pipe(Effect.provide(SectionRepositoryLive)),
      );

      return await Effect.runPromise(
        repo.reorderSections(websiteId, sectionIds).pipe(
          Effect.map(() => ({
            success: true as const,
            data: undefined as void,
          })),
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
        }).pipe(Effect.provide(SectionRepositoryLive)),
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
