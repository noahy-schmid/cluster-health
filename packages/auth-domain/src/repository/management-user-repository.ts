import { ManagementAuthTokenPayload, Result } from "../types";

export class ManagementUserRepository {
  public async registerUser(
    email: string,
    password: string,
  ): Promise<Result<void, string>> {
    return { success: false, errors: "Not implemented yet" };
  }

  public async authenticateToken(
    token: string,
  ): Promise<Result<ManagementAuthTokenPayload, string>> {
    return { success: false, errors: "Not implemented yet" };
  }

  public async authenticateCredentials(
    email: string,
    password: string,
  ): Promise<Result<string, string>> {
    return { success: false, errors: "Not implemented yet" };
  }

  public async bindSalonToUser(
    userId: string,
    salonId: string,
  ): Promise<Result<void, string>> {
    return { success: false, errors: "Not implemented yet" };
  }
}
