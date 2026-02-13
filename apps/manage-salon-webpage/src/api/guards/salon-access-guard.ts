import "server-only";

import { cookies } from "next/headers";
import { ManagementUserRepository } from "@repo/auth-domain";

export class SalonAccessGuard {
  /**
   * Checks whether the current authenticated user can access the given salon.
   * @param salonId - Salon ID to check access for.
   * @returns Result with salonId on success or error message on failure.
   */
  public async canAccessSalon(
    salonId: string,
  ): Promise<{ success: true; salonId: string } | { success: false; error: string }> {
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

    if (authResult.data.salonId !== salonId) {
      return { success: false, error: "Nicht autorisiert" };
    }

    return { success: true, salonId };
  }
}
