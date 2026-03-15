import "server-only";

import { SalonAccessGuard } from "./salon.guard";

export const EmployeeGuard = {
  async canEditEmployee(
    salonId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const access = await SalonAccessGuard.canAccessSalon(salonId);
    if (!access.success) {
      return { success: false, error: access.error };
    }
    return { success: true };
  },
};
