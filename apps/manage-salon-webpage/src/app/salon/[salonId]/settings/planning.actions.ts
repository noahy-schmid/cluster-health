"use server";

import {
  CLIMAZON_SLUG,
  CreateResourceUseCase,
  CreateResourceUseCaseLayer,
  DeleteResourceUseCase,
  DeleteResourceUseCaseLayer,
  type Resource,
  SEAT_SLUG,
  UpdateResourceUseCase,
  UpdateResourceUseCaseLayer,
} from "@repo/salon-domain";
import { Effect } from "effect";
import { SalonAccessGuard } from "@/api/guards/salon.guard";
import { fetchSalonResources } from "@/api/salon-read.actions";

type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string };

type ResourceInput = {
  name: string;
  amount: number;
};

function getWellKnownResourceLabel(
  slug: typeof SEAT_SLUG | typeof CLIMAZON_SLUG,
) {
  if (slug === SEAT_SLUG) {
    return "Bedienplätze";
  }

  return "Climazons";
}

/**
 * ### Action to create a new salon resource for appointment planning.
 * Creates a new resource with the provided name and quantity that can be used for appointment planning and service definitions.
 *
 * - The caller must be authenticated and have access to the salon.
 * - The resource slug needs to be unique across the salon.
 */
export async function createSalonResource(
  salonId: string,
  input: ResourceInput & { slug: string },
): Promise<ActionResult<Resource>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const resource = yield* CreateResourceUseCase.execute({
        salonId,
        slug: input.slug,
        name: input.name,
        amount: input.amount,
      });

      return { success: true as const, data: resource };
    }).pipe(
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.succeed({
            success: false as const,
            error: error.message,
          }),
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Salon nicht gefunden",
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ausstattung konnte nicht erstellt werden",
          }),
      }),
      Effect.provide(CreateResourceUseCaseLayer),
    ),
  );
}

/**
 * ### Action to update an existing salon resource for appointment planning.
 * Updates the name and quantity of a resource used by appointment-planning and service definitions.
 *
 * - The caller must be authenticated and have access to the salon.
 * - The resource must exist for the given slug.
 * - The amount must be non-negative.
 */
export async function updateSalonResource(
  salonId: string,
  slug: string,
  input: ResourceInput,
): Promise<ActionResult<Resource>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const resource = yield* UpdateResourceUseCase.execute({
        salonId,
        slug,
        name: input.name,
        amount: input.amount,
      });

      return { success: true as const, data: resource };
    }).pipe(
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.succeed({
            success: false as const,
            error: error.message,
          }),
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ausstattung nicht gefunden",
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ausstattung konnte nicht gespeichert werden",
          }),
      }),
      Effect.provide(UpdateResourceUseCaseLayer),
    ),
  );
}

/**
 * ### Action to delete a salon resource.
 * Removes a resource from the salon when it is no longer referenced by service phases.
 *
 * - The caller must be authenticated and have access to the salon.
 * - The resource must not be referenced by any service phase.
 */
export async function deleteSalonResource(
  salonId: string,
  slug: string,
): Promise<ActionResult<null>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      yield* DeleteResourceUseCase.execute({ salonId, slug });
      return { success: true as const, data: null };
    }).pipe(
      Effect.catchTags({
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ausstattung nicht gefunden",
          }),
        ConflictError: (error) =>
          Effect.succeed({
            success: false as const,
            error: error.message,
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ausstattung konnte nicht gelöscht werden",
          }),
      }),
      Effect.provide(DeleteResourceUseCaseLayer),
    ),
  );
}

/**
 * ### Action to upsert a well-known salon planning resource.
 * Creates or updates the canonical planning resources for seats and climazons, keeping the label and slug stable.
 *
 * - The caller must be authenticated and have access to the salon.
 * - The quantity is the only configurable input; slug and name are fixed for well-known resources.
 */
export async function upsertWellKnownSalonResource(
  salonId: string,
  slug: typeof SEAT_SLUG | typeof CLIMAZON_SLUG,
  amount: number,
): Promise<ActionResult<Resource | null>> {
  const existingResources = await fetchSalonResources(salonId);
  if (!existingResources.success) {
    return existingResources;
  }

  const existingResource =
    existingResources.data.find((resource) => resource.slug === slug) ?? null;
  const name = getWellKnownResourceLabel(slug);

  if (existingResource) {
    return updateSalonResource(salonId, slug, {
      name,
      amount,
    });
  }

  return createSalonResource(salonId, {
    slug,
    name,
    amount,
  });
}
