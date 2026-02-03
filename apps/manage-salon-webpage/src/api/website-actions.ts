"use server";

import { db, websitesTable } from "@repo/website-database";
import { randomUUID } from "crypto";

/**
 * Server action to create a new website
 * Returns the created website ID
 */
export async function createWebsite(): Promise<
  | {
      success: true;
      websiteId: string;
    }
  | {
      success: false;
      error: string;
    }
> {
  const newWebsite: typeof websitesTable.$inferInsert = {
    salonId: randomUUID(),
    heroImage: "",
    logo: "",
    slug: `salon-${Date.now()}`,
  };

  try {
    const insertedWebsite = await db
      .insert(websitesTable)
      .values(newWebsite)
      .returning();
    return { success: true, websiteId: insertedWebsite[0].id };
  } catch (error) {
    console.error("Error creating website:", error);
    return {
      success: false,
      error: "Failed to create website",
    };
  }
}
