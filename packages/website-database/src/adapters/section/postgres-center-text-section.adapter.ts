import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { SectionPersistenceError } from "../../ports/section.port";
import { Database } from "../../infrastructure/database.interface";
import { centerTextSectionsTable } from "../../schema";
import { CenterTextSectionAdapter } from "./section-type-adapter";

const make = Effect.gen(function* () {
  const { db } = yield* Database;

  return {
    createTypeData: (sectionId: string) =>
      Effect.tryPromise(() =>
        db
          .insert(centerTextSectionsTable)
          .values({
            id: sectionId,
            title: "Neuer Text Abschnitt",
            content: "Fügen Sie hier Ihren Text hinzu",
          })
          .returning()
          .then(([row]) => ({
            title: row!.title,
            content: row!.content,
          })),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to create center-text section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    updateTypeData: (
      sectionId: string,
      settings: { title: string; content: string },
    ) =>
      Effect.tryPromise(() =>
        db
          .update(centerTextSectionsTable)
          .set({ title: settings.title, content: settings.content })
          .where(eq(centerTextSectionsTable.id, sectionId)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to update center-text section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    fetchTypeData: (sectionId: string) =>
      Effect.tryPromise(async () => {
        const [row] = await db
          .select()
          .from(centerTextSectionsTable)
          .where(eq(centerTextSectionsTable.id, sectionId));

        if (!row) return undefined;
        return { title: row.title, content: row.content };
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to fetch center-text section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    validateSettings: () => Effect.void,
  };
});

export const PostgresCenterTextSectionAdapter = Layer.effect(
  CenterTextSectionAdapter,
  make,
);
