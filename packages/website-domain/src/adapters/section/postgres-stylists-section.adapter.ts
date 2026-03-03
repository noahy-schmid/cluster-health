import { Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { SectionPersistenceError } from "../../ports/section.port";
import { Database } from "../../infrastructure/database.interface";
import { stylistsSectionsTable } from "../../schema";
import { StylistsSectionAdapter } from "./section-type-adapter";

const make = Effect.gen(function* () {
  const { db } = yield* Database;

  return {
    createTypeData: (sectionId: string) =>
      Effect.tryPromise(() =>
        db
          .insert(stylistsSectionsTable)
          .values({
            id: sectionId,
            title: "Unser Team",
            subtitle: "Lernen Sie unsere professionellen Stylisten kennen",
          })
          .returning()
          .then(([row]) => ({
            title: row!.title,
            subtitle: row!.subtitle,
          })),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to create stylists section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    updateTypeData: (
      sectionId: string,
      settings: { title: string; subtitle: string },
    ) =>
      Effect.tryPromise(() =>
        db
          .update(stylistsSectionsTable)
          .set({ title: settings.title, subtitle: settings.subtitle })
          .where(eq(stylistsSectionsTable.id, sectionId)),
      ).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to update stylists section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    fetchTypeData: (sectionId: string) =>
      Effect.tryPromise(async () => {
        const [row] = await db
          .select()
          .from(stylistsSectionsTable)
          .where(eq(stylistsSectionsTable.id, sectionId));

        if (!row) return undefined;
        return { title: row.title, subtitle: row.subtitle };
      }).pipe(
        Effect.mapError(
          (error) =>
            new SectionPersistenceError({
              message: `Failed to fetch stylists section data: ${String(error)}`,
              cause: error,
            }),
        ),
      ),

    validateSettings: () => Effect.void,
  };
});

export const PostgresStylistsSectionAdapter = Layer.effect(
  StylistsSectionAdapter,
  make,
);
