import { eq } from "drizzle-orm";
import { db } from "../database";
import { salonsTable } from "../schema";
import { CreateSalonInput, Result, Salon, UpdateSalonInput } from "../types";

export class SalonRepository {
  /**
   * Creates a new salon record.
   * @param input - Core salon details from onboarding.
   * @returns Result with the created salon or an error message.
   */
  async createSalon(input: CreateSalonInput): Promise<Result<Salon, string>> {
    try {
      const [created] = await db
        .insert(salonsTable)
        .values({
          name: input.name,
          street: input.street,
          postalCode: input.postalCode,
          city: input.city,
          phone: input.phone,
        })
        .returning();

      if (!created) {
        return { success: false, errors: "Failed to create salon" };
      }

      return { success: true, data: created };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      if (
        error?.cause?.code === "23505" ||
        error?.cause?.constraint === "salons_name_ci_unique"
      ) {
        return { success: false, errors: "Salon name already exists" };
      }

      console.error("Error creating salon:", JSON.stringify(error));
      return { success: false, errors: "Failed to create salon" };
    }
  }

  /**
   * Fetches a salon by its ID.
   * @param id - Salon ID to look up.
   * @returns Result with the salon or an error message.
   */
  async fetchSalonById(id: string): Promise<Result<Salon, string>> {
    try {
      const [salon] = await db
        .select()
        .from(salonsTable)
        .where(eq(salonsTable.id, id));

      if (!salon) {
        return { success: false, errors: "Salon not found" };
      }

      return { success: true, data: salon };
    } catch (error) {
      console.error("Error fetching salon:", error);
      return { success: false, errors: "Failed to fetch salon" };
    }
  }

  /**
   * Updates an existing salon.
   * @param id - Salon ID to update.
   * @param updates - Full set of salon fields to update.
   * @returns Result with the updated salon or an error message.
   */
  async updateSalon(
    id: string,
    updates: UpdateSalonInput,
  ): Promise<Result<Salon, string>> {
    try {
      const [updated] = await db
        .update(salonsTable)
        .set({
          name: updates.name,
          street: updates.street,
          postalCode: updates.postalCode,
          city: updates.city,
          phone: updates.phone,
          updatedAt: new Date(),
        })
        .where(eq(salonsTable.id, id))
        .returning();

      if (!updated) {
        return { success: false, errors: "Salon not found" };
      }

      return { success: true, data: updated };
    } catch (error) {
      console.error("Error updating salon:", error);
      return { success: false, errors: "Failed to update salon" };
    }
  }
}
