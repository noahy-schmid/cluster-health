import { db, reasonSectionsTable, reasonItemsTable } from "../index";
import { eq } from "drizzle-orm";
import { Section, ReasonItem } from "./types";
import {
  SectionTypeRepository,
  CreateSectionResult,
  FetchSectionResult,
} from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class ReasonSectionRepository implements SectionTypeRepository<"reason"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  // Validation helper
  private validateReasonItems(items: ReasonItem[]): {
    valid: boolean;
    error?: string;
  } {
    // Check count
    if (items.length < 2 || items.length > 4) {
      return { valid: false, error: "Reason section must have 2-4 items" };
    }

    // Check image consistency
    const itemsWithImages = items.filter(
      (item) => item.imageUrl && item.imageUrl.trim() !== "",
    );
    if (itemsWithImages.length > 0 && itemsWithImages.length !== items.length) {
      return {
        valid: false,
        error: "Either all reasons must have images or none should have images",
      };
    }

    return { valid: true };
  }

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<CreateSectionResult<"reason">> {
    try {
      // Insert into sections table via base repository
      const insertedSection = await this.baseSectionRepo.createSection(
        websiteId,
        "reason",
        position,
      );

      if (!insertedSection) {
        return { success: false, error: "Failed to insert section" };
      }

      // Insert into reason_sections table with defaults
      const [insertedReasonSection] = await db
        .insert(reasonSectionsTable)
        .values({
          id: insertedSection.id,
          title: "Warum wir?",
          subtitle: "Entdecken Sie, was uns auszeichnet",
        })
        .returning();

      if (!insertedReasonSection) {
        return { success: false, error: "Failed to insert reason section" };
      }

      // Create 2 default items
      await db.insert(reasonItemsTable).values([
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

      return { success: true, section: newSection };
    } catch (error) {
      console.error("Error creating reason section:", error);
      return { success: false, error: "Failed to create reason section" };
    }
  }

  async updateSection(
    section: Omit<Section<"reason">, "type" | "order">,
  ): Promise<boolean> {
    try {
      // Validate items
      const validation = this.validateReasonItems(section.settings.items);
      if (!validation.valid) {
        console.error("Validation error:", validation.error);
        return false;
      }

      return await db.transaction(async (tx) => {
        // Update sections table via base repository
        const updatedSections =
          await this.baseSectionRepo.updateSectionMetadata(
            section.id,
            { menuTitle: section.menuTitle ?? null },
            tx,
          );

        if (updatedSections.length === 0) {
          return false;
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
            imageUrl: item.imageUrl || null,
            order: index,
          })),
        );

        return true;
      });
    } catch (error) {
      console.error("Error updating reason section:", error);
      return false;
    }
  }

  async fetchSection(id: string): Promise<FetchSectionResult<"reason">> {
    try {
      // Fetch the section from sections table via base repository
      const dbSection = await this.baseSectionRepo.fetchSectionById(
        id,
        "reason",
      );

      if (!dbSection) {
        return { success: false, error: "Reason section not found" };
      }

      // Fetch reason details
      const [reasonSection] = await db
        .select()
        .from(reasonSectionsTable)
        .where(eq(reasonSectionsTable.id, id));

      if (!reasonSection) {
        return { success: false, error: "Reason section details not found" };
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
            imageUrl: item.imageUrl || undefined,
          })),
        },
        order: dbSection.order,
        menuTitle: dbSection.menuTitle ?? undefined,
      };

      return { success: true, section };
    } catch (error) {
      console.error("Error fetching reason section:", error);
      return { success: false, error: "Failed to fetch reason section" };
    }
  }
}
