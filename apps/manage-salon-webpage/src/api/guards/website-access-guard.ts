import "server-only";

import { cookies } from "next/headers";
import { eq } from "drizzle-orm";
import { db, websitesTable } from "@repo/website-database";
import { ManagementUserRepository } from "@repo/auth-domain";

export class WebsiteAccessGuard {
  /**
   * Checks whether the current authenticated user can edit the given website.
   * @param websiteId - Website ID to check access for.
   * @returns Result with void on success or error message on failure.
   */
  public async canEditWebsite(
    websiteId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const session = (await cookies()).get("session");
    if (!session?.value) {
      return { success: false, error: "Sitzung abgelaufen" };
    }

    const authRepository = new ManagementUserRepository();
    const authResult = await authRepository.authenticateToken(session.value);

    if (!authResult.success) {
      return { success: false, error: "Ungültige Sitzung" };
    }

    if (!authResult.data.salonId) {
      return { success: false, error: "Kein Salon zugeordnet" };
    }

    const [website] = await db
      .select({ salonId: websitesTable.salonId })
      .from(websitesTable)
      .where(eq(websitesTable.id, websiteId));

    if (!website) {
      return { success: false, error: "Website nicht gefunden" };
    }

    if (website.salonId !== authResult.data.salonId) {
      return { success: false, error: "Nicht autorisiert" };
    }

    return { success: true };
  }
}
