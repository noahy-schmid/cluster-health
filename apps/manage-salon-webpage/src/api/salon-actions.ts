"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { ManagementUserRepository } from "@repo/auth-domain";
import {
  CLIMAZON_SLUG,
  CreateResourceUseCase,
  CreateResourceUseCaseLayer,
  CreateSalonUseCase,
  CreateSalonUseCaseLayer,
  DeleteResourceUseCase,
  DeleteResourceUseCaseLayer,
  GetSalonUseCase,
  GetSalonUseCaseLayer,
  ListResourcesUseCase,
  ListResourcesUseCaseLayer,
  type Resource,
  type Salon,
  SEAT_SLUG,
  UpdateResourceUseCase,
  UpdateResourceUseCaseLayer,
  UpdateSalonUseCase,
  UpdateSalonUseCaseLayer,
} from "@repo/salon-domain";
import { Effect } from "effect";
import { SalonAccessGuard } from "./guards/salon.guard";

const createSalonSchema = z.object({
  salonName: z.string().min(1),
  street: z.string().min(1),
  postalCode: z.string().min(1),
  city: z.string().min(1),
  phone: z.string().min(1),
});

type CreateSalonActionResult =
  | { success: true }
  | {
      success: false;
      errors?: {
        salonName?: { errors: string[] };
        street?: { errors: string[] };
        postalCode?: { errors: string[] };
        city?: { errors: string[] };
        phone?: { errors: string[] };
        form?: { errors: string[] };
      };
    };

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

type ResourceInput = {
  name: string;
  amount: number;
};

function getResourceDisplayName(slug: typeof SEAT_SLUG | typeof CLIMAZON_SLUG) {
  if (slug === SEAT_SLUG) {
    return "Bedienplätze";
  }

  return "Climazons";
}

/**
 * Creates a salon, binds it to the current management user, and redirects to
 * the resource onboarding step.
 */
export async function createSalonAction(
  _prevState: unknown,
  formData: FormData,
): Promise<CreateSalonActionResult> {
  const data = Object.fromEntries(formData.entries());
  const parsed = createSalonSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: z.treeifyError(parsed.error).properties,
    };
  }

  const session = (await cookies()).get("session");
  if (!session?.value) {
    return {
      success: false,
      errors: {
        form: { errors: ["Sitzung abgelaufen. Bitte erneut anmelden."] },
      },
    };
  }

  const authRepository = new ManagementUserRepository();
  const authResult = await authRepository.authenticateToken(session.value);

  if (!authResult.success) {
    return {
      success: false,
      errors: {
        form: { errors: ["Ungültige Sitzung. Bitte erneut anmelden."] },
      },
    };
  }

  if (authResult.data.salonId) {
    return {
      success: false,
      errors: {
        form: { errors: ["Ihr Konto ist bereits mit einem Salon verbunden."] },
      },
    };
  }

  const createResult = await Effect.runPromise(
    Effect.gen(function* () {
      const useCase = yield* CreateSalonUseCase;
      const salon = yield* useCase.execute({
        name: parsed.data.salonName,
        street: parsed.data.street,
        postalCode: parsed.data.postalCode,
        city: parsed.data.city,
        phone: parsed.data.phone,
      });

      return { success: true as const, data: salon };
    }).pipe(
      Effect.catchTags({
        ValidationError: (error) =>
          Effect.succeed({
            success: false as const,
            errors: {
              form: { errors: [error.message] },
            },
          }),
        ConflictError: () =>
          Effect.succeed({
            success: false as const,
            errors: {
              salonName: { errors: ["Salonname ist bereits vergeben."] },
            },
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            errors: {
              form: { errors: ["Salon konnte nicht erstellt werden."] },
            },
          }),
      }),
      Effect.provide(CreateSalonUseCaseLayer),
    ),
  );

  if (!createResult.success) {
    return createResult;
  }

  const bindResult = await authRepository.bindSalonToUser(
    authResult.data.userId,
    createResult.data.id,
  );

  if (!bindResult.success) {
    return {
      success: false,
      errors: {
        form: { errors: [bindResult.errors] },
      },
    };
  }

  const tokenResult = await authRepository.issueTokenForUser(
    authResult.data.userId,
  );

  if (!tokenResult.success) {
    return {
      success: false,
      errors: {
        form: { errors: [tokenResult.errors] },
      },
    };
  }

  (await cookies()).set("session", tokenResult.data.token, {
    expires: tokenResult.data.payload.expiresAt,
    secure: true,
    httpOnly: true,
    sameSite: "strict",
  });

  redirect(`/onboarding/${createResult.data.id}/resources`);
}

export async function fetchSalon(
  salonId: string,
): Promise<ActionResult<Salon>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const useCase = yield* GetSalonUseCase;
      const salon = yield* useCase.execute({ salonId });
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
      const useCase = yield* UpdateSalonUseCase;
      const salon = yield* useCase.execute({
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

export async function fetchSalonResources(
  salonId: string,
): Promise<ActionResult<Resource[]>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, error: access.error };
  }

  return Effect.runPromise(
    Effect.gen(function* () {
      const useCase = yield* ListResourcesUseCase;
      const resources = yield* useCase.execute({ salonId });
      return { success: true as const, data: resources };
    }).pipe(
      Effect.catchTag("InternalError", () =>
        Effect.succeed({
          success: false as const,
          error: "Ressourcen konnten nicht geladen werden",
        }),
      ),
      Effect.provide(ListResourcesUseCaseLayer),
    ),
  );
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
      const useCase = yield* CreateResourceUseCase;
      const resource = yield* useCase.execute({
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
            error: "Ressource konnte nicht erstellt werden",
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
      const useCase = yield* UpdateResourceUseCase;
      const resource = yield* useCase.execute({
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
            error: "Ressource nicht gefunden",
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ressource konnte nicht gespeichert werden",
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
      const useCase = yield* DeleteResourceUseCase;
      yield* useCase.execute({ salonId, slug });
      return { success: true as const, data: null };
    }).pipe(
      Effect.catchTags({
        NotFoundError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ressource nicht gefunden",
          }),
        ConflictError: (error) =>
          Effect.succeed({
            success: false as const,
            error: error.message,
          }),
        InternalError: () =>
          Effect.succeed({
            success: false as const,
            error: "Ressource konnte nicht gelöscht werden",
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
  const name = getResourceDisplayName(slug);

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
