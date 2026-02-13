import { eq } from "drizzle-orm";
import { db } from "../database";
import { stylistsTable } from "../schema";
import { CreateStylistInput, Result, Stylist, UpdateStylistInput } from "../types";

export class StylistRepository {
  /**
   * Creates a new stylist record.
   * @param input - Stylist details including salonId.
   * @returns Result with the created stylist or an error message.
   */
  async createStylist(input: CreateStylistInput): Promise<Result<Stylist, string>> {
    try {
      const [created] = await db
        .insert(stylistsTable)
        .values({
          salonId: input.salonId,
          name: input.name,
          subtitle: input.subtitle,
          description: input.description,
          profileImage: input.profileImage,
        })
        .returning();

      if (!created) {
        return { success: false, errors: "Failed to create stylist" };
      }

      return { success: true, data: created };
    } catch (error) {
      console.error("Error creating stylist:", error);
      return { success: false, errors: "Failed to create stylist" };
    }
  }

  /**
   * Fetches all stylists for a salon.
   * @param salonId - Salon ID to fetch stylists for.
   * @returns Result with array of stylists or an error message.
   */
  async fetchStylistsBySalonId(salonId: string): Promise<Result<Stylist[], string>> {
    try {
      const stylists = await db
        .select()
        .from(stylistsTable)
        .where(eq(stylistsTable.salonId, salonId));

      return { success: true, data: stylists };
    } catch (error) {
      console.error("Error fetching stylists:", error);
      return { success: false, errors: "Failed to fetch stylists" };
    }
  }

  /**
   * Fetches a single stylist by ID.
   * @param id - Stylist ID to look up.
   * @returns Result with the stylist or an error message.
   */
  async fetchStylistById(id: string): Promise<Result<Stylist, string>> {
    try {
      const [stylist] = await db
        .select()
        .from(stylistsTable)
        .where(eq(stylistsTable.id, id));

      if (!stylist) {
        return { success: false, errors: "Stylist not found" };
      }

      return { success: true, data: stylist };
    } catch (error) {
      console.error("Error fetching stylist:", error);
      return { success: false, errors: "Failed to fetch stylist" };
    }
  }

  /**
   * Updates an existing stylist.
   * @param id - Stylist ID to update.
   * @param updates - Fields to update.
   * @returns Result with the updated stylist or an error message.
   */
  async updateStylist(
    id: string,
    updates: UpdateStylistInput,
  ): Promise<Result<Stylist, string>> {
    try {
      const [updated] = await db
        .update(stylistsTable)
        .set({
          name: updates.name,
          subtitle: updates.subtitle,
          description: updates.description,
          profileImage: updates.profileImage,
          updatedAt: new Date(),
        })
        .where(eq(stylistsTable.id, id))
        .returning();

      if (!updated) {
        return { success: false, errors: "Stylist not found" };
      }

      return { success: true, data: updated };
    } catch (error) {
      console.error("Error updating stylist:", error);
      return { success: false, errors: "Failed to update stylist" };
    }
  }

  /**
   * Deletes a stylist.
   * @param id - Stylist ID to delete.
   * @returns Result with success or an error message.
   */
  async deleteStylist(id: string): Promise<Result<void, string>> {
    try {
      const result = await db
        .delete(stylistsTable)
        .where(eq(stylistsTable.id, id))
        .returning();

      if (result.length === 0) {
        return { success: false, errors: "Stylist not found" };
      }

      return { success: true, data: undefined };
    } catch (error) {
      console.error("Error deleting stylist:", error);
      return { success: false, errors: "Failed to delete stylist" };
    }
  }
}
