import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { SectionPersistenceError } from "../../ports/section.port";
import { Database } from "../../infrastructure/database.interface";
import { gallerySectionsTable, galleryImagesTable } from "../../schema";
import { GallerySectionAdapter } from "./section-type-adapter";

const make = Effect.gen(function* () {
  const { db } = yield* Database;

  return {
    createTypeData: (sectionId: string) =>
      Effect.tryPromise(() =>
        db
          .insert(gallerySectionsTable)
          .values({
            id: sectionId,
            title: "New Gallery",
            subtitle: "Gallery subtitle",
          })
          .returning()
          .then(([row]) => ({
            title: row!.title,
            subtitle: row!.subtitle,
            imageIds: [] as string[],
          })),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to create gallery section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    updateTypeData: (
      sectionId: string,
      settings: { title: string; subtitle: string; imageIds: string[] },
    ) =>
      Effect.tryPromise(async () => {
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
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to update gallery section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    fetchTypeData: (sectionId: string) =>
      Effect.tryPromise(async () => {
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
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to fetch gallery section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    validateSettings: () => Effect.void,
  };
});

export const PostgresGallerySectionAdapter = Layer.effect(
  GallerySectionAdapter,
  make,
);
