"use server";

import { GetSalonUseCase, GetSalonUseCaseLayer } from "@repo/salon-domain";
import {
  ListResourcesUseCase,
  ListResourcesUseCaseLayer,
  type Resource,
  type Salon,
} from "@repo/salon-domain";
import { Effect } from "effect";
import { SalonAccessGuard } from "./guards/salon.guard";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

/**
 * ### Fetches a salon by ID for authenticated users.
 *
 * - The calling user must be logged in and have access to the requested salon.
 *
 * @param salonId The identifier of the salon to fetch.
 * @returns An object containing the salon data on success, or an error message on failure.
 */
export async function fetchSalon(
  salonId: string,
): Promise<ActionResult<Salon>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const salon = yield* GetSalonUseCase.execute({ salonId });
      return { success: true as const, data: salon };
    }).pipe(
      Effect.catchTags({
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon nicht gefunden",
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon konnte nicht geladen werden",
          }),
      }),
      Effect.provide(GetSalonUseCaseLayer),
    ),
  );
}

/**
 * Loads appointment-planning resources for an authorized salon. Consumers use
 * this in onboarding, settings, and service configuration screens.
 */
export async function fetchSalonResources(
  salonId: string,
): Promise<ActionResult<Resource[]>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const resources = yield* ListResourcesUseCase.execute({ salonId });
      return { success: true as const, data: resources };
    }).pipe(
      Effect.catchTag("InternalError", () =>
        Effect.succeed({
          success: false as const,
          error: "Angaben für die Terminplanung konnten nicht geladen werden",
        }),
      ),
      Effect.provide(ListResourcesUseCaseLayer),
    ),
  );
}
