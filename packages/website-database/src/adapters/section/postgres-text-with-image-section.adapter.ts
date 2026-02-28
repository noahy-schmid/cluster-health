import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { SectionPersistenceError } from "../../ports/section.port";
import { Database } from "../../infrastructure/database.interface";
import { textWithImageSectionsTable } from "../../schema";
import { TextWithImageSectionAdapter } from "./section-type-adapter";

const make = Effect.gen(function* () {
  const { db } = yield* Database;

  return {
    createTypeData: (sectionId: string) =>
      Effect.tryPromise(() =>
        db
          .insert(textWithImageSectionsTable)
          .values({
            id: sectionId,
            title: "New Text with Image Section",
            content: "Add your text here",
            image: "",
          })
          .returning()
          .then(([row]) => ({
            imageId: row!.image,
            title: row!.title,
            text: row!.content,
          })),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to create text-with-image section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    updateTypeData: (
      sectionId: string,
      settings: { imageId: string; title: string; text: string },
    ) =>
      Effect.tryPromise(() =>
        db
          .update(textWithImageSectionsTable)
          .set({
            title: settings.title,
            content: settings.text,
            image: settings.imageId,
          })
          .where(eq(textWithImageSectionsTable.id, sectionId)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to update text-with-image section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    fetchTypeData: (sectionId: string) =>
      Effect.tryPromise(async () => {
        const [row] = await db
          .select()
          .from(textWithImageSectionsTable)
          .where(eq(textWithImageSectionsTable.id, sectionId));

        if (!row) return undefined;
        return { imageId: row.image, title: row.title, text: row.content };
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to fetch text-with-image section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    validateSettings: () => Effect.void,
  };
});

export const PostgresTextWithImageSectionAdapter = Layer.effect(
  TextWithImageSectionAdapter,
  make,
);
