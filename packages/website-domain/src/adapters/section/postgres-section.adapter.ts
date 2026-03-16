import { Effect, Layer } from "effect";
import { and, eq, gt, gte, lt, lte, sql } from "drizzle-orm";
import {
  SectionPort,
  SectionPersistenceError,
  type PortSectionType,
  type PortAllSections,
} from "../../ports/section.port";
import { sectionsTable } from "../../schema";
import { Database } from "../../infrastructure/database.interface";
import {
  GallerySectionAdapter,
  TextWithImageSectionAdapter,
  CenterTextSectionAdapter,
  ReasonSectionAdapter,
  StylistsSectionAdapter,
} from "./section-type-adapter";

const VALID_SECTION_TYPES = new Set<string>([
  "gallery",
  "text-with-image",
  "center-text",
  "reason",
  "stylists-section",
]);

const isValidSectionType = (type: string): type is PortSectionType =>
  VALID_SECTION_TYPES.has(type);

const make = Effect.gen(function* () {
  yield* Effect.log("Initializing PostgresSectionAdapter");

  const { db } = yield* Database;
  const galleryAdapter = yield* GallerySectionAdapter;
  const textWithImageAdapter = yield* TextWithImageSectionAdapter;
  const centerTextAdapter = yield* CenterTextSectionAdapter;
  const reasonAdapter = yield* ReasonSectionAdapter;
  const stylistsAdapter = yield* StylistsSectionAdapter;

  const createTypeData = (sectionId: string, type: PortSectionType) => {
    switch (type) {
      case "gallery":
        return galleryAdapter.createTypeData(sectionId);
      case "text-with-image":
        return textWithImageAdapter.createTypeData(sectionId);
      case "center-text":
        return centerTextAdapter.createTypeData(sectionId);
      case "reason":
        return reasonAdapter.createTypeData(sectionId);
      case "stylists-section":
        return stylistsAdapter.createTypeData(sectionId);
    }
  };

  const updateTypeData = (section: PortAllSections) => {
    switch (section.type) {
      case "gallery":
        return galleryAdapter.updateTypeData(section.id, section.settings);
      case "text-with-image":
        return textWithImageAdapter.updateTypeData(
          section.id,
          section.settings,
        );
      case "center-text":
        return centerTextAdapter.updateTypeData(section.id, section.settings);
      case "reason":
        return reasonAdapter.updateTypeData(section.id, section.settings);
      case "stylists-section":
        return stylistsAdapter.updateTypeData(section.id, section.settings);
    }
  };

  const validateSettings = (section: PortAllSections) => {
    switch (section.type) {
      case "gallery":
        return galleryAdapter.validateSettings(section.settings);
      case "text-with-image":
        return textWithImageAdapter.validateSettings(section.settings);
      case "center-text":
        return centerTextAdapter.validateSettings(section.settings);
      case "reason":
        return reasonAdapter.validateSettings(section.settings);
      case "stylists-section":
        return stylistsAdapter.validateSettings(section.settings);
    }
  };

  const fetchTypeData = (sectionId: string, type: PortSectionType) => {
    switch (type) {
      case "gallery":
        return galleryAdapter.fetchTypeData(sectionId);
      case "text-with-image":
        return textWithImageAdapter.fetchTypeData(sectionId);
      case "center-text":
        return centerTextAdapter.fetchTypeData(sectionId);
      case "reason":
        return reasonAdapter.fetchTypeData(sectionId);
      case "stylists-section":
        return stylistsAdapter.fetchTypeData(sectionId);
    }
  };

  const createSection: SectionPort["createSection"] = (
    websiteId,
    type,
    position,
  ) =>
    Effect.gen(function* () {
      const baseSection = yield* Effect.tryPromise(() =>
        db.transaction(async (tx) => {
          await tx
            .update(sectionsTable)
            .set({ order: sql`${sectionsTable.order} + 1` })
            .where(
              and(
                eq(sectionsTable.websiteId, websiteId),
                gte(sectionsTable.order, position),
              ),
            );

          const insertedRows = await tx
            .insert(sectionsTable)
            .values({ websiteId, type, order: position })
            .returning();

          return insertedRows[0];
        }),
      ).pipe(
        Effect.mapError((error) =>
          error instanceof SectionPersistenceError
            ? error
            : new SectionPersistenceError({
                message: `Failed to insert base section: ${String(error)}`,
                cause: error,
              }),
        ),
      );

      if (!baseSection) {
        return yield* Effect.fail(
          new SectionPersistenceError({
            message: "Failed to insert base section - no result returned",
          }),
        );
      }

      const settings = yield* createTypeData(baseSection.id, type);

      return {
        id: baseSection.id,
        order: baseSection.order,
        menuTitle: baseSection.menuTitle,
        type,
        settings,
      } as PortAllSections;
    });

  const updateSection: SectionPort["updateSection"] = (section) =>
    Effect.gen(function* () {
      yield* validateSettings(section);

      const updatedRows = yield* Effect.tryPromise(() =>
        db
          .update(sectionsTable)
          .set({ menuTitle: section.menuTitle })
          .where(eq(sectionsTable.id, section.id))
          .returning(),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to update base section ${section.id}: ${String(error)}`,
              cause: error,
            }),
        ),
      );

      if (updatedRows.length === 0) {
        return yield* Effect.fail(
          new SectionPersistenceError({
            message: `Section not found: ${section.id}`,
          }),
        );
      }

      yield* updateTypeData(section);
    });

  const deleteSection: SectionPort["deleteSection"] = (websiteId, sectionId) =>
    Effect.tryPromise(() =>
      db
        .delete(sectionsTable)
        .where(
          and(
            eq(sectionsTable.id, sectionId),
            eq(sectionsTable.websiteId, websiteId),
          ),
        ),
    ).pipe(
      Effect.mapError(
        (error) =>
          new SectionPersistenceError({
            message: `Failed to delete section ${sectionId}: ${String(error)}`,
            cause: error,
          }),
      ),
    );

  const reorderSections: SectionPort["reorderSections"] = (
    websiteId,
    sectionId,
    newIndex,
  ) =>
    Effect.gen(function* () {
      return yield* Effect.tryPromise(() =>
        db.transaction(async (tx) => {
          const currentRows = await tx
            .select({ order: sectionsTable.order })
            .from(sectionsTable)
            .where(
              and(
                eq(sectionsTable.id, sectionId),
                eq(sectionsTable.websiteId, websiteId),
              ),
            )
            .limit(1);

          const currentIndex = currentRows[0]?.order;

          if (currentIndex === undefined) {
            throw new SectionPersistenceError({
              message: `Section ${sectionId} does not belong to website ${websiteId}`,
              isValidation: true,
            });
          }

          if (currentIndex === newIndex) {
            return;
          }

          if (newIndex < currentIndex) {
            await tx
              .update(sectionsTable)
              .set({ order: sql`${sectionsTable.order} + 1` })
              .where(
                and(
                  eq(sectionsTable.websiteId, websiteId),
                  gte(sectionsTable.order, newIndex),
                  lt(sectionsTable.order, currentIndex),
                ),
              );
          } else {
            await tx
              .update(sectionsTable)
              .set({ order: sql`${sectionsTable.order} - 1` })
              .where(
                and(
                  eq(sectionsTable.websiteId, websiteId),
                  gt(sectionsTable.order, currentIndex),
                  lte(sectionsTable.order, newIndex),
                ),
              );
          }

          await tx
            .update(sectionsTable)
            .set({ order: newIndex })
            .where(
              and(
                eq(sectionsTable.id, sectionId),
                eq(sectionsTable.websiteId, websiteId),
              ),
            );
        }),
      ).pipe(
        Effect.mapError((error) =>
          error instanceof SectionPersistenceError
            ? error
            : new SectionPersistenceError({
                message: `Failed to reorder section ${sectionId}: ${String(error)}`,
                cause: error,
              }),
        ),
      );
    });

  const fetchSectionsByWebsiteId: SectionPort["fetchSectionsByWebsiteId"] = (
    websiteId,
  ) =>
    Effect.gen(function* () {
      const baseSections = yield* Effect.tryPromise(() =>
        db
          .select()
          .from(sectionsTable)
          .where(eq(sectionsTable.websiteId, websiteId))
          .orderBy(sectionsTable.order),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to fetch sections for website ${websiteId}: ${String(error)}`,
              cause: error,
            }),
        ),
      );

      const results: PortAllSections[] = [];

      for (const baseSection of baseSections) {
        if (!isValidSectionType(baseSection.type)) {
          yield* Effect.logWarning(
            `Skipping section ${baseSection.id} with unknown type: ${baseSection.type}`,
          );
          continue;
        }

        const sectionType = baseSection.type;
        const settings = yield* fetchTypeData(baseSection.id, sectionType);

        if (!settings) {
          yield* Effect.logWarning(
            `Skipping section ${baseSection.id}: type-specific data not found`,
          );
          continue;
        }

        results.push({
          id: baseSection.id,
          order: baseSection.order,
          menuTitle: baseSection.menuTitle,
          type: sectionType,
          settings,
        } as PortAllSections);
      }

      return results;
    });

  const sectionExists: SectionPort["sectionExists"] = (websiteId, sectionId) =>
    Effect.tryPromise(() =>
      db
        .select({ count: sql`count(*)` })
        .from(sectionsTable)
        .where(
          and(
            eq(sectionsTable.id, sectionId),
            eq(sectionsTable.websiteId, websiteId),
          ),
        )
        .limit(1),
    ).pipe(
      Effect.mapError(
        (error) =>
          new SectionPersistenceError({
            message: `Failed to check existence of section ${sectionId}: ${String(error)}`,
            cause: error,
          }),
      ),
      Effect.map((rows) => {
        const count = Number(rows[0]?.count ?? 0);
        return count > 0;
      }),
    );

  return {
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    fetchSectionsByWebsiteId,
    sectionExists,
  } satisfies SectionPort;
});

/**
 * PostgreSQL adapter for the SectionPort.
 * Delegates type-specific operations to individual section type adapters.
 */
export const PostgresSectionAdapter = Layer.effect(SectionPort, make);
