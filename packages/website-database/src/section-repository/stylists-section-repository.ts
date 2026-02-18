import { db } from "../database";
import { stylistsSectionsTable } from "../schema";
import { eq } from "drizzle-orm";
import { Section, Result } from "./types";
import { SectionTypeRepository } from "./section-type-repository";
import { BaseSectionRepository } from "./base-section-repository";

export class StylistsSectionRepository implements SectionTypeRepository<"stylists-section"> {
  constructor(private baseSectionRepo: BaseSectionRepository) {}

  async createSection(
    websiteId: string,
    position: number,
  ): Promise<Result<Section<"stylists-section">, string>> {
    try {
      const result = await db.transaction(async (tx) => {
        // Insert into sections table via base repository
        const insertedSection = await this.baseSectionRepo.createSection(
          websiteId,
          "stylists-section",
          position,
          tx,
        );

        if (!insertedSection) {
          return {
            success: false as const,
            errors: "Failed to insert section",
          };
        }

        // Insert into stylists_sections table
        const [insertedStylistsSection] = await tx
          .insert(stylistsSectionsTable)
          .values({
            id: insertedSection.id,
            title: "Unser Team",
            subtitle: "Lernen Sie unsere professionellen Stylisten kennen",
          })
          .returning();

        if (!insertedStylistsSection) {
          return {
            success: false as const,
            errors: "Failed to insert stylists section",
          };
        }

        const newSection: Section<"stylists-section"> = {
          id: insertedSection.id,
          type: "stylists-section",
          settings: {
            title: insertedStylistsSection.title,
            subtitle: insertedStylistsSection.subtitle,
          },
          order: insertedSection.order,
          menuTitle: insertedSection.menuTitle ?? undefined,
        };

        return { success: true as const, data: newSection };
      });

      return result;
    } catch (error) {
      console.error("Error creating stylists section:", error);
      return {
        success: false,
        errors: "Failed to create stylists section",
      };
    }
  }

  async updateSection(
    section: Omit<Section<"stylists-section">, "type" | "order">,
  ): Promise<Result<void, string>> {
    try {
      await db.transaction(async (tx) => {
        // Update sections table via base repository
        const updatedSections =
          await this.baseSectionRepo.updateSectionMetadata(
            section.id,
            { menuTitle: section.menuTitle ?? null },
            tx,
          );

        // If no rows were updated, section doesn't exist
        if (updatedSections.length === 0) {
          throw new Error("Section not found");
        }

        // Update stylists_sections table
        await tx
          .update(stylistsSectionsTable)
          .set({
            title: section.settings.title,
            subtitle: section.settings.subtitle,
          })
          .where(eq(stylistsSectionsTable.id, section.id));
      });

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error updating stylists section:", error);
      return {
        success: false,
        errors:
          error instanceof Error
            ? error.message
            : "Failed to update stylists section",
      };
    }
  }

  async fetchSection(
    sectionId: string,
  ): Promise<Result<Section<"stylists-section">, string>> {
    try {
      // Fetch base section data
      const baseSection = await this.baseSectionRepo.fetchSectionById(
        sectionId,
        "stylists-section",
      );

      if (!baseSection) {
        return {
          success: false,
          errors: "Section not found",
        };
      }

      // Fetch stylists section data
      const [stylistsSectionData] = await db
        .select()
        .from(stylistsSectionsTable)
        .where(eq(stylistsSectionsTable.id, sectionId));

      if (!stylistsSectionData) {
        return {
          success: false,
          errors: "Stylists section data not found",
        };
      }

      const section: Section<"stylists-section"> = {
        id: baseSection.id,
        type: "stylists-section",
        settings: {
          title: stylistsSectionData.title,
          subtitle: stylistsSectionData.subtitle,
        },
        order: baseSection.order,
        menuTitle: baseSection.menuTitle ?? undefined,
      };

      return { success: true, data: section };
    } catch (error) {
      console.error("Error fetching stylists section:", error);
      return {
        success: false,
        errors: "Failed to fetch stylists section",
      };
    }
  }
}
