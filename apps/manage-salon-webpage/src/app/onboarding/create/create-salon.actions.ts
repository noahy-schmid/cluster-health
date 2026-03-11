"use server";

import { redirect } from "next/navigation";
import z from "zod";
import {
  CreateSalonUseCase,
  CreateSalonUseCaseLayer,
} from "@repo/salon-domain";
import { ManagementUserRepository } from "@repo/auth-domain";
import { Effect } from "effect";
import { AuthGuard } from "@/api/guards/auth.guard";
import { setSessionCookie } from "@/api/session";

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

/**
 * Creates a salon, binds it to the current management user, and redirects to
 * the onboarding step for appointment planning data.
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

  const authPayload = await AuthGuard.getAuthToken();
  if (!authPayload) {
    return {
      success: false,
      errors: {
        form: { errors: ["Sitzung abgelaufen. Bitte erneut anmelden."] },
      },
    };
  }

  if (authPayload.salonId) {
    return {
      success: false,
      errors: {
        form: { errors: ["Ihr Konto ist bereits mit einem Salon verbunden."] },
      },
    };
  }

  const createResult = await Effect.runPromise(
    Effect.gen(function* () {
      const salon = yield* CreateSalonUseCase.execute({
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

  const authRepository = new ManagementUserRepository();
  const bindResult = await authRepository.bindSalonToUser(
    authPayload.userId,
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

  const tokenResult = await authRepository.issueTokenForUser(authPayload.userId);
  if (!tokenResult.success) {
    return {
      success: false,
      errors: {
        form: { errors: [tokenResult.errors] },
      },
    };
  }

  await setSessionCookie(tokenResult.data.token, tokenResult.data.payload);
  redirect(`/onboarding/${createResult.data.id}/resources`);
}
