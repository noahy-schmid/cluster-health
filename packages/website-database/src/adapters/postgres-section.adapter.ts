import { Effect, Layer } from "effect";
import { eq, and } from "drizzle-orm";
import {
  SectionPort,
  SectionPersistenceError,
  type PortSectionType,
  type PortAllSections,
  type PortSection,
} from "../ports/section.port";
import {
  sectionsTable,
  gallerySectionsTable,
  galleryImagesTable,
  textWithImageSectionsTable,
  centerTextSectionsTable,
  reasonSectionsTable,
  reasonItemsTable,
  stylistsSectionsTable,
} from "../schema";
import { Database } from "../infrastructure/database.interface";
import type { NodePgDatabase } from "drizzle-orm/node-postgres";

// --- Internal type-specific handler interface ---

interface SectionTypeHandler<T extends PortSectionType> {
  createTypeData(
    db: NodePgDatabase,
    sectionId: string,
  ): Promise<PortSection<T>["settings"]>;

  updateTypeData(
    db: NodePgDatabase,
    sectionId: string,
    settings: PortSection<T>["settings"],
  ): Promise<void>;

  fetchTypeData(
    db: NodePgDatabase,
    sectionId: string,
  ): Promise<PortSection<T>["settings"] | undefined>;
}

// --- Gallery handler ---

const galleryHandler: SectionTypeHandler<"gallery"> = {
  async createTypeData(db, sectionId) {
    const [row] = await db
      .insert(gallerySectionsTable)
      .values({
        id: sectionId,
        title: "New Gallery",
        subtitle: "Gallery subtitle",
      })
      .returning();
    return { title: row!.title, subtitle: row!.subtitle, imageIds: [] };
  },

  async updateTypeData(db, sectionId, settings) {
    await db
      .update(gallerySectionsTable)
      .set({ title: settings.title, subtitle: settings.subtitle })
      .where(eq(gallerySectionsTable.id, sectionId));

    await db
      .delete(galleryImagesTable)
      .where(eq(galleryImagesTable.gallerySectionId, sectionId));

    if (settings.imageIds.length > 0) {
      await db.insert(galleryImagesTable).values(
        settings.imageIds.map((imageId, index) => ({
          gallerySectionId: sectionId,
          imageUrl: imageId,
          order: index,
        })),
      );
    }
  },

  async fetchTypeData(db, sectionId) {
    const [row] = await db
      .select()
      .from(gallerySectionsTable)
      .where(eq(gallerySectionsTable.id, sectionId));

    if (!row) return undefined;

    const images = await db
      .select()
      .from(galleryImagesTable)
      .where(eq(galleryImagesTable.gallerySectionId, sectionId))
      .orderBy(galleryImagesTable.order);

    return {
      title: row.title,
      subtitle: row.subtitle,
      imageIds: images.map((img) => img.imageUrl),
    };
  },
};

// --- Text with Image handler ---

const textWithImageHandler: SectionTypeHandler<"text-with-image"> = {
  async createTypeData(db, sectionId) {
    const [row] = await db
      .insert(textWithImageSectionsTable)
      .values({
        id: sectionId,
        title: "New Text with Image Section",
        content: "Add your text here",
        image: "",
      })
      .returning();
    return { imageId: row!.image, title: row!.title, text: row!.content };
  },

  async updateTypeData(db, sectionId, settings) {
    await db
      .update(textWithImageSectionsTable)
      .set({
        title: settings.title,
        content: settings.text,
        image: settings.imageId,
      })
      .where(eq(textWithImageSectionsTable.id, sectionId));
  },

  async fetchTypeData(db, sectionId) {
    const [row] = await db
      .select()
      .from(textWithImageSectionsTable)
      .where(eq(textWithImageSectionsTable.id, sectionId));

    if (!row) return undefined;
    return { imageId: row.image, title: row.title, text: row.content };
  },
};

// --- Center Text handler ---

const centerTextHandler: SectionTypeHandler<"center-text"> = {
  async createTypeData(db, sectionId) {
    const [row] = await db
      .insert(centerTextSectionsTable)
      .values({
        id: sectionId,
        title: "Neuer Text Abschnitt",
        content: "Fügen Sie hier Ihren Text hinzu",
      })
      .returning();
    return { title: row!.title, content: row!.content };
  },

  async updateTypeData(db, sectionId, settings) {
    await db
      .update(centerTextSectionsTable)
      .set({ title: settings.title, content: settings.content })
      .where(eq(centerTextSectionsTable.id, sectionId));
  },

  async fetchTypeData(db, sectionId) {
    const [row] = await db
      .select()
      .from(centerTextSectionsTable)
      .where(eq(centerTextSectionsTable.id, sectionId));

    if (!row) return undefined;
    return { title: row.title, content: row.content };
  },
};

// --- Reason handler ---

const reasonHandler: SectionTypeHandler<"reason"> = {
  async createTypeData(db, sectionId) {
    const [row] = await db
      .insert(reasonSectionsTable)
      .values({
        id: sectionId,
        title: "Warum wir?",
        subtitle: "Entdecken Sie, was uns auszeichnet",
      })
      .returning();

    await db.insert(reasonItemsTable).values([
      {
        reasonSectionId: sectionId,
        title: "Grund 1",
        description: "Beschreibung für Grund 1",
        order: 0,
      },
      {
        reasonSectionId: sectionId,
        title: "Grund 2",
        description: "Beschreibung für Grund 2",
        order: 1,
      },
    ]);

    return {
      title: row!.title,
      subtitle: row!.subtitle,
      items: [
        { title: "Grund 1", description: "Beschreibung für Grund 1" },
        { title: "Grund 2", description: "Beschreibung für Grund 2" },
      ],
    };
  },

  async updateTypeData(db, sectionId, settings) {
    await db
      .update(reasonSectionsTable)
      .set({ title: settings.title, subtitle: settings.subtitle })
      .where(eq(reasonSectionsTable.id, sectionId));

    await db
      .delete(reasonItemsTable)
      .where(eq(reasonItemsTable.reasonSectionId, sectionId));

    await db.insert(reasonItemsTable).values(
      settings.items.map((item, index) => ({
        reasonSectionId: sectionId,
        title: item.title,
        description: item.description,
        imageUrl: item.imageId || null,
        order: index,
      })),
    );
  },

  async fetchTypeData(db, sectionId) {
    const [row] = await db
      .select()
      .from(reasonSectionsTable)
      .where(eq(reasonSectionsTable.id, sectionId));

    if (!row) return undefined;

    const items = await db
      .select()
      .from(reasonItemsTable)
      .where(eq(reasonItemsTable.reasonSectionId, sectionId))
      .orderBy(reasonItemsTable.order);

    return {
      title: row.title,
      subtitle: row.subtitle,
      items: items.map((item) => ({
        title: item.title,
        description: item.description,
        imageId: item.imageUrl || undefined,
      })),
    };
  },
};

// --- Stylists handler ---

const stylistsHandler: SectionTypeHandler<"stylists-section"> = {
  async createTypeData(db, sectionId) {
    const [row] = await db
      .insert(stylistsSectionsTable)
      .values({
        id: sectionId,
        title: "Unser Team",
        subtitle: "Lernen Sie unsere professionellen Stylisten kennen",
      })
      .returning();
    return { title: row!.title, subtitle: row!.subtitle };
  },

  async updateTypeData(db, sectionId, settings) {
    await db
      .update(stylistsSectionsTable)
      .set({ title: settings.title, subtitle: settings.subtitle })
      .where(eq(stylistsSectionsTable.id, sectionId));
  },

  async fetchTypeData(db, sectionId) {
    const [row] = await db
      .select()
      .from(stylistsSectionsTable)
      .where(eq(stylistsSectionsTable.id, sectionId));

    if (!row) return undefined;
    return { title: row.title, subtitle: row.subtitle };
  },
};

// --- Handler registry ---

const VALID_SECTION_TYPES = new Set<string>([
  "gallery",
  "text-with-image",
  "center-text",
  "reason",
  "stylists-section",
]);

const isValidSectionType = (type: string): type is PortSectionType =>
  VALID_SECTION_TYPES.has(type);

/**
 * Helper to dispatch updateTypeData for a given section.
 * Uses a type-narrowing switch to maintain type safety across the union.
 */
async function dispatchUpdate(
  dbInstance: NodePgDatabase,
  section: PortAllSections,
): Promise<void> {
  switch (section.type) {
    case "gallery":
      return galleryHandler.updateTypeData(
        dbInstance,
        section.id,
        section.settings,
      );
    case "text-with-image":
      return textWithImageHandler.updateTypeData(
        dbInstance,
        section.id,
        section.settings,
      );
    case "center-text":
      return centerTextHandler.updateTypeData(
        dbInstance,
        section.id,
        section.settings,
      );
    case "reason":
      return reasonHandler.updateTypeData(
        dbInstance,
        section.id,
        section.settings,
      );
    case "stylists-section":
      return stylistsHandler.updateTypeData(
        dbInstance,
        section.id,
        section.settings,
      );
  }
}

/**
 * Helper to dispatch fetchTypeData and construct a PortAllSections object.
 * Uses a type-narrowing switch to maintain type safety.
 */
async function dispatchFetch(
  dbInstance: NodePgDatabase,
  sectionId: string,
  order: number,
  menuTitle: string | null,
  type: PortSectionType,
): Promise<PortAllSections | undefined> {
  switch (type) {
    case "gallery": {
      const s = await galleryHandler.fetchTypeData(dbInstance, sectionId);
      return s
        ? { id: sectionId, order, menuTitle, type, settings: s }
        : undefined;
    }
    case "text-with-image": {
      const s = await textWithImageHandler.fetchTypeData(dbInstance, sectionId);
      return s
        ? { id: sectionId, order, menuTitle, type, settings: s }
        : undefined;
    }
    case "center-text": {
      const s = await centerTextHandler.fetchTypeData(dbInstance, sectionId);
      return s
        ? { id: sectionId, order, menuTitle, type, settings: s }
        : undefined;
    }
    case "reason": {
      const s = await reasonHandler.fetchTypeData(dbInstance, sectionId);
      return s
        ? { id: sectionId, order, menuTitle, type, settings: s }
        : undefined;
    }
    case "stylists-section": {
      const s = await stylistsHandler.fetchTypeData(dbInstance, sectionId);
      return s
        ? { id: sectionId, order, menuTitle, type, settings: s }
        : undefined;
    }
  }
}

/**
 * Helper to dispatch createTypeData and construct a PortAllSections object.
 * Uses a type-narrowing switch to maintain type safety.
 */
async function dispatchCreate(
  dbInstance: NodePgDatabase,
  sectionId: string,
  order: number,
  menuTitle: string | null,
  type: PortSectionType,
): Promise<PortAllSections> {
  switch (type) {
    case "gallery": {
      const s = await galleryHandler.createTypeData(dbInstance, sectionId);
      return { id: sectionId, order, menuTitle, type, settings: s };
    }
    case "text-with-image": {
      const s = await textWithImageHandler.createTypeData(
        dbInstance,
        sectionId,
      );
      return { id: sectionId, order, menuTitle, type, settings: s };
    }
    case "center-text": {
      const s = await centerTextHandler.createTypeData(dbInstance, sectionId);
      return { id: sectionId, order, menuTitle, type, settings: s };
    }
    case "reason": {
      const s = await reasonHandler.createTypeData(dbInstance, sectionId);
      return { id: sectionId, order, menuTitle, type, settings: s };
    }
    case "stylists-section": {
      const s = await stylistsHandler.createTypeData(dbInstance, sectionId);
      return { id: sectionId, order, menuTitle, type, settings: s };
    }
  }
}

// --- Adapter implementation ---

const make = Effect.gen(function* () {
  yield* Effect.log("Initializing PostgresSectionAdapter");

  const { db } = yield* Database;

  const createSection: SectionPort["createSection"] = (
    websiteId,
    type,
    position,
  ) =>
    Effect.tryPromise(() =>
      db.transaction(async (tx) => {
        const [baseSection] = await tx
          .insert(sectionsTable)
          .values({ websiteId, type, order: position })
          .returning();

        if (!baseSection) {
          throw new Error("Failed to insert base section");
        }

        return dispatchCreate(
          tx as unknown as NodePgDatabase,
          baseSection.id,
          baseSection.order,
          baseSection.menuTitle,
          type,
        );
      }),
    ).pipe(
      Effect.mapError(
        (error) =>
          new SectionPersistenceError({
            message: `Failed to create ${type} section: ${error.message}`,
            cause: error,
          }),
      ),
    );

  const updateSection: SectionPort["updateSection"] = (section) =>
    Effect.tryPromise(() =>
      db.transaction(async (tx) => {
        const updatedRows = await tx
          .update(sectionsTable)
          .set({ menuTitle: section.menuTitle })
          .where(eq(sectionsTable.id, section.id))
          .returning();

        if (updatedRows.length === 0) {
          throw new Error(`Section not found: ${section.id}`);
        }

        await dispatchUpdate(tx as unknown as NodePgDatabase, section);
      }),
    ).pipe(
      Effect.mapError(
        (error) =>
          new SectionPersistenceError({
            message: `Failed to update section ${section.id}: ${error.message}`,
            cause: error,
          }),
      ),
    );

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
            message: `Failed to delete section ${sectionId}: ${error.message}`,
            cause: error,
          }),
      ),
    );

  const reorderSections: SectionPort["reorderSections"] = (
    websiteId,
    sectionIds,
  ) =>
    Effect.tryPromise(() =>
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
      Effect.mapError(
        (error) =>
          new SectionPersistenceError({
            message: `Failed to reorder sections for website ${websiteId}: ${error.message}`,
            cause: error,
          }),
      ),
    );

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
              message: `Failed to fetch sections for website ${websiteId}: ${error.message}`,
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
        const section = yield* Effect.tryPromise(() =>
          dispatchFetch(
            db,
            baseSection.id,
            baseSection.order,
            baseSection.menuTitle,
            sectionType,
          ),
        ).pipe(
          Effect.mapError(
            (error) =>
              new SectionPersistenceError({
                message: `Failed to fetch ${baseSection.type} data for section ${baseSection.id}: ${String(error)}`,
                cause: error,
              }),
          ),
        );

        if (!section) {
          yield* Effect.logWarning(
            `Skipping section ${baseSection.id}: type-specific data not found`,
          );
          continue;
        }

        results.push(section);
      }

      return results;
    });

  return {
    createSection,
    updateSection,
    deleteSection,
    reorderSections,
    fetchSectionsByWebsiteId,
  } satisfies SectionPort;
});

/**
 * PostgreSQL adapter for the SectionPort.
 * Handles persistence for all section types using Drizzle ORM.
 */
export const PostgresSectionAdapter = Layer.effect(SectionPort, make);
