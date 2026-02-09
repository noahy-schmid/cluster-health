"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";
import { ManagementUserRepository } from "@repo/auth-domain";
import { SalonRepository } from "@repo/salon-domain";

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
 * Creates a salon, binds it to the current management user, and redirects to the salon page.
 * @param prevState - Previous action state (unused).
 * @param formData - Form data from onboarding/create.
 * @returns Success state or field errors.
 */
export async function createSalonAction(
  prevState: unknown,
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

  const salonRepository = new SalonRepository();
  const createResult = await salonRepository.createSalon({
    name: parsed.data.salonName,
    street: parsed.data.street,
    postalCode: parsed.data.postalCode,
    city: parsed.data.city,
    phone: parsed.data.phone,
  });

  if (!createResult.success) {
    if (createResult.errors === "Salon name already exists") {
      return {
        success: false,
        errors: {
          salonName: { errors: ["Salonname ist bereits vergeben."] },
        },
      };
    }

    return {
      success: false,
      errors: {
        form: { errors: [createResult.errors] },
      },
    };
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

  redirect(`/salon/${createResult.data.id}`);
}
