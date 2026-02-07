"use server";

import { SignJWT } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import z from "zod";

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

async function createSession(userId: string) {
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day
  const session = await new SignJWT({ userId })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(expires)
    .sign(new TextEncoder().encode(process.env.JWT_SECRET || "default_secret"));

  (await cookies()).set("session", session, {
    expires,
    secure: true,
    httpOnly: true,
  });
}

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

  // Simulate authentication logic
  if (email !== "admin@admin.com" || password !== "password") {
    return {
      success: false,
      errors: {
        email: { errors: ["Ungültige E-Mail-Adresse oder Passwort"] },
        password: { errors: ["Ungültige E-Mail-Adresse oder Passwort"] },
      },
    };
  }

  await createSession("admin"); // Simulate user ID

  redirect("/website");
}
