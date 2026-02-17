import "server-only";

import { AuthGuard } from "./auth.guard";

export class SalonAccessGuard {
  /**
   * Checks whether the current authenticated user can access the given salon.
   * @param salonId - Salon ID to check access for.
   * @returns Result with salonId on success or error message on failure.
   */
  public static async canAccessSalon(
    salonId: string,
  ): Promise<
    { success: true; salonId: string } | { success: false; error: string }
  > {
    const authToken = await AuthGuard.getAuthToken();

    if (!authToken) {
      return { success: false, error: "Ungültige Sitzung" };
    }

    if (!authToken.salonId) {
      return { success: false, error: "Kein Salon zugeordnet" };
    }

    if (authToken.salonId !== salonId) {
      return { success: false, error: "Nicht autorisiert" };
    }

    return { success: true, salonId };
  }
}
