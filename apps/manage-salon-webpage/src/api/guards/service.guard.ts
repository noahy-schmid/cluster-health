import "server-only";

import { AuthGuard } from "./auth.guard";

export const ServiceGuard = {
  async canEditService(
    salonId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
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

    return { success: true };
  },
};
