import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { SectionPersistenceError } from "../../ports/section.port";
import { Database } from "../../infrastructure/database.interface";
import { reasonSectionsTable, reasonItemsTable } from "../../schema";
import type { PortReasonItem } from "../../ports/section.port";
import { ReasonSectionAdapter } from "./section-type-adapter";

const MIN_REASON_ITEMS = 2;
const MAX_REASON_ITEMS = 4;

const make = Effect.gen(function* () {
  const { db } = yield* Database;

  return {
    createTypeData: (sectionId: string) =>
      Effect.tryPromise(async () => {
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
          ] as PortReasonItem[],
        };
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to create reason section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    updateTypeData: (
      sectionId: string,
      settings: { title: string; subtitle: string; items: PortReasonItem[] },
    ) =>
      Effect.tryPromise(async () => {
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
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to update reason section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    fetchTypeData: (sectionId: string) =>
      Effect.tryPromise(async () => {
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
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to fetch reason section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    validateSettings: (settings: {
      title: string;
      subtitle: string;
      items: PortReasonItem[];
    }) =>
      Effect.gen(function* () {
        if (
          settings.items.length < MIN_REASON_ITEMS ||
          settings.items.length > MAX_REASON_ITEMS
        ) {
          return yield* Effect.fail(
            new SectionPersistenceError({
              message: `Reason section must have ${MIN_REASON_ITEMS}-${MAX_REASON_ITEMS} items`,
              isValidation: true,
            }),
          );
        }

        const itemsWithImages = settings.items.filter(
          (item) => item.imageId && item.imageId.trim() !== "",
        );
        if (
          itemsWithImages.length > 0 &&
          itemsWithImages.length !== settings.items.length
        ) {
          return yield* Effect.fail(
            new SectionPersistenceError({
              message:
                "Either all reasons must have images or none should have images",
              isValidation: true,
            }),
          );
        }
      }),
  };
});

export const PostgresReasonSectionAdapter = Layer.effect(
  ReasonSectionAdapter,
  make,
);
