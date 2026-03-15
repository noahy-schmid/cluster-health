/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { redirect } from "next/navigation";
import z from "zod";
import { ManagementUserRepository } from "@repo/auth-domain";
import { setSessionCookie } from "./session";

const loginActionSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type LoginActionResult =
  | { success: true }
  | {
      success: false;
      errors?: {
        email?: { errors: string[] };
        password?: { errors: string[] };
      };
    };

const registerActionSchema = z.object({
  email: z.email(),
  password: z.string(),
});

type RegisterActionResult =
  | { success: true }
  | {
      success: false;
      errors?: {
        email?: { errors: string[] };
        password?: { errors: string[] };
      };
    };

export async function loginAction(
  prevState: any,
  formData: FormData,
): Promise<LoginActionResult> {
  const data = Object.fromEntries(formData.entries());
  const parsed = loginActionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: z.treeifyError(parsed.error).properties,
    };
  }

  const { email, password } = parsed.data;

  const repository = new ManagementUserRepository();
  const authResult = await repository.authenticateCredentials(email, password);

  if (!authResult.success) {
    const message = "Ungültige E-Mail-Adresse oder Passwort";
    return {
      success: false,
      errors: {
        email: { errors: [message] },
        password: { errors: [message] },
      },
    };
  }

  await setSessionCookie(authResult.data.token, authResult.data.payload);
  redirect(
    authResult.data.payload.salonId
      ? `/salon/${authResult.data.payload.salonId}`
      : "/onboarding",
  );
}

/**
 * Registers a management user and starts a session.
 * @param prevState Previous action state (unused).
 * @param formData FormData containing registration fields.
 * @returns Success state or field errors.
 */
export async function registerAction(
  prevState: any,
  formData: FormData,
): Promise<RegisterActionResult> {
  const data = Object.fromEntries(formData.entries());
  const parsed = registerActionSchema.safeParse(data);

  if (!parsed.success) {
    return {
      success: false,
      errors: z.treeifyError(parsed.error).properties,
    };
  }

  const { email, password } = parsed.data;
  const repository = new ManagementUserRepository();
  const registerResult = await repository.registerUser(email, password);

  if (!registerResult.success) {
    return {
      success: false,
      errors: {
        email: {
          errors: ["E-Mail-Adresse ist bereits registriert"],
        },
      },
    };
  }

  const authResult = await repository.authenticateCredentials(email, password);
  if (!authResult.success) {
    return {
      success: false,
      errors: {
        email: {
          errors: ["Registrierung fehlgeschlagen. Bitte erneut versuchen."],
        },
      },
    };
  }

  await setSessionCookie(authResult.data.token, authResult.data.payload);
  redirect(
    authResult.data.payload.salonId
      ? `/salon/${authResult.data.payload.salonId}`
      : "/onboarding",
  );
}
