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

  if (amount <= 0) {
    return { success: true, data: existingResource };
  }

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
