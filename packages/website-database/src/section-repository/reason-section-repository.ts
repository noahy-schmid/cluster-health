import { db } from "../database";
import { reasonSectionsTable, reasonItemsTable } from "../schema";
import { eq } from "drizzle-orm";
import { Section, Result, ReasonItem } from "./types";
import { SectionTypeRepository } from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class ReasonSectionRepository implements SectionTypeRepository<"reason"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  // Validation helper
  private validateReasonItems(items: ReasonItem[]): Result<void, string> {
    // Check count
    if (items.length < 2 || items.length > 4) {
      return { success: false, errors: "Reason section must have 2-4 items" };
    }

    // Check image consistency
    const itemsWithImages = items.filter(
      (item) => item.imageId && item.imageId.trim() !== "",
    );
    if (itemsWithImages.length > 0 && itemsWithImages.length !== items.length) {
      return {
        success: false,
        errors:
          "Either all reasons must have images or none should have images",
      };
    }

    return { success: true, data: undefined };
  }

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<Result<Section<"reason">, string>> {
    try {
      const result = await db.transaction(
        async (tx): Promise<Result<Section<"reason">, string>> => {
          // Insert into sections table via base repository
          const insertedSection = await this.baseSectionRepo.createSection(
            websiteId,
            "reason",
            position,
            tx,
          );

          if (!insertedSection) {
            return { success: false, errors: "Failed to insert section" };
          }

          // Insert into reason_sections table with defaults
          const [insertedReasonSection] = await tx
            .insert(reasonSectionsTable)
            .values({
              id: insertedSection.id,
              title: "Warum wir?",
              subtitle: "Entdecken Sie, was uns auszeichnet",
            })
            .returning();

          if (!insertedReasonSection) {
            return {
              success: false,
              errors: "Failed to insert reason section",
            };
          }

          // Create 2 default items
          await tx.insert(reasonItemsTable).values([
            {
              reasonSectionId: insertedSection.id,
              title: "Grund 1",
              description: "Beschreibung für Grund 1",
              order: 0,
            },
            {
              reasonSectionId: insertedSection.id,
              title: "Grund 2",
              description: "Beschreibung für Grund 2",
              order: 1,
            },
          ]);

          const newSection: Section<"reason"> = {
            id: insertedSection.id,
            type: "reason",
            settings: {
              title: insertedReasonSection.title,
              subtitle: insertedReasonSection.subtitle,
              items: [
                { title: "Grund 1", description: "Beschreibung für Grund 1" },
                { title: "Grund 2", description: "Beschreibung für Grund 2" },
              ],
            },
            order: insertedSection.order,
            menuTitle: insertedSection.menuTitle ?? undefined,
          };

          return { success: true, data: newSection };
        },
      );

      return result;
    } catch (error) {
      console.error("Error creating reason section:", error);
      return { success: false, errors: "Failed to create reason section" };
    }
  }

  async updateSection(
    section: Omit<Section<"reason">, "type" | "order">,
  ): Promise<Result<void, string>> {
    try {
      // Validate items
      const validation = this.validateReasonItems(section.settings.items);
      if (!validation.success) {
        return validation;
      }

      await db.transaction(async (tx) => {
        // Update sections table via base repository
        const updatedSections =
          await this.baseSectionRepo.updateSectionMetadata(
            section.id,
            { menuTitle: section.menuTitle ?? null },
            tx,
          );

        // If no rows were updated, section doesn't exist - stop here
        if (updatedSections.length === 0) {
          throw new Error("Section not found");
        }

        // Update reason_sections table
        await tx
          .update(reasonSectionsTable)
          .set({
            title: section.settings.title,
            subtitle: section.settings.subtitle,
          })
          .where(eq(reasonSectionsTable.id, section.id));

        // Delete existing items and re-insert
        await tx
          .delete(reasonItemsTable)
          .where(eq(reasonItemsTable.reasonSectionId, section.id));

        // Insert new items
        await tx.insert(reasonItemsTable).values(
          section.settings.items.map((item, index) => ({
            reasonSectionId: section.id,
            title: item.title,
            description: item.description,
            imageUrl: item.imageId || null,
            order: index,
          })),
        );
      });
      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error updating reason section:", error);
      return { success: false, errors: "Failed to update section" };
    }
  }

  async fetchSection(id: string): Promise<Result<Section<"reason">, string>> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(
        id,
        "reason",
      );

      if (!dbSection) {
        return { success: false, errors: "Reason section not found" };
      }

      // Fetch reason details
      const [reasonSection] = await db
        .select()
        .from(reasonSectionsTable)
        .where(eq(reasonSectionsTable.id, id));

      if (!reasonSection) {
        return { success: false, errors: "Reason section details not found" };
      }

      // Fetch items for this reason section
      const items = await db
        .select()
        .from(reasonItemsTable)
        .where(eq(reasonItemsTable.reasonSectionId, id))
        .orderBy(reasonItemsTable.order);

      const section: Section<"reason"> = {
        id: dbSection.id,
        type: "reason",
        settings: {
          title: reasonSection.title,
          subtitle: reasonSection.subtitle,
          items: items.map((item) => ({
            title: item.title,
            description: item.description,
            imageId: item.imageUrl || undefined,
          })),
        },
        order: dbSection.order,
        menuTitle: dbSection.menuTitle ?? undefined,
      };

      return { success: true, data: section };
    } catch (error) {
      console.error("Error fetching reason section:", error);
      return { success: false, errors: "Failed to fetch reason section" };
    }
  }
}
