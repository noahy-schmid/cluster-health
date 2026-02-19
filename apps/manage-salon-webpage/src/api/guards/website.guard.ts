import "server-only";

import { eq } from "drizzle-orm";
import { db, websitesTable } from "@repo/website-database";
import { AuthGuard } from "./auth.guard";

export class WebsiteAccessGuard {
  /**
   * Checks whether the current authenticated user can edit the given website.
   * @param websiteId - Website ID to check access for.
   * @returns Result with void on success or error message on failure.
   */
  public static async canEditWebsite(
    websiteId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const session = await AuthGuard.getAuthToken();

    if (!session) {
      return { success: false, error: "Ungültige Sitzung" };
    }

    if (!session.salonId) {
      return { success: false, error: "Kein Salon zugeordnet" };
    }

    const [website] = await db
      .select({ salonId: websitesTable.salonId })
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId));

    if (!website) {
      return { success: false, error: "Website nicht gefunden" };
    }

    if (website.salonId !== session.salonId) {
      return { success: false, error: "Nicht autorisiert" };
    }

    return { success: true };
  }
}
