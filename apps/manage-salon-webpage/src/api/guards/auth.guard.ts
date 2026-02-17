import "server-only";

import {
  ManagementAuthTokenPayload,
  ManagementUserRepository,
} from "@repo/auth-domain";
import { cookies } from "next/headers";

export class AuthGuard {
  public static async getAuthToken(): Promise<
    ManagementAuthTokenPayload | undefined
  > {
    const session = (await cookies()).get("session");
    if (!session?.value) {
      return undefined;
    }
    const repository = new ManagementUserRepository();
    const authResult = await repository.authenticateToken(session.value);
    if (!authResult.success) {
      return undefined;
    }
    return authResult.data;
  }
}
