"use server";

import {
  UpdateSalonUseCase,
  UpdateSalonUseCaseLayer,
} from "@repo/salon-domain";
import type { Salon } from "@repo/salon-domain";
import { Effect } from "effect";
import { SalonAccessGuard } from "@/api/guards/salon.guard";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type SalonSettingsInput = {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
};

/**
 * ### Action to update the salon's base data from the settings screen.
 * Persists the salon's name, address, and contact details after verifying salon access.
 *
 * - The caller must be authenticated and have access to the salon.
 * - The salon name must be unique across all salons.
 */
export async function updateSalonSettings(
  salonId: string,
  input: SalonSettingsInput,
): Promise<ActionResult<Salon>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const salon = yield* UpdateSalonUseCase.execute({
        salonId,
        name: input.name,
        street: input.street,
        postalCode: input.postalCode,
        city: input.city,
        phone: input.phone,
      });

      return { success: true as const, data: salon };
    }).pipe(
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.succeed({
            success: false as const,
            error: error.message,
          }),
        ConflictError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salonname ist bereits vergeben",
          }),
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon nicht gefunden",
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon konnte nicht gespeichert werden",
          }),
      }),
      Effect.provide(UpdateSalonUseCaseLayer),
    ),
  );
}
