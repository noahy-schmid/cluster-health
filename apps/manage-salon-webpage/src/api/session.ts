import "server-only";

import { cookies } from "next/headers";

/**
 * Sets the session cookie from a JWT token.
 */
export async function setSessionCookie(
  token: string,
  payload: { expiresAt?: Date },
): Promise<void> {
  const production = process.env.NODE_ENV === "production";

  (await cookies()).set("session", token, {
    secure: production,
    httpOnly: true,
    sameSite: "strict",
    path: "/",
    expires: payload.expiresAt,
  });
}
