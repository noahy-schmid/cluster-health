import { ManagementAuthTokenPayload, ManagementUserRole, Result } from "../types";
import { db } from "../database";
import { managementUserTable, managementUserRoleTable } from "../schema";
import { eq, and, isNull } from "drizzle-orm";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { SignJWT, jwtVerify } from "jose";

const scryptAsync = promisify(scrypt);

export class ManagementUserRepository {
  /**
   * Hashes a password using scrypt
   * @param password - Plain text password
   * @returns Hashed password in format: salt.hash
   */
  private async hashPassword(password: string): Promise<string> {
    const salt = randomBytes(16).toString("hex");
    const buf = (await scryptAsync(password, salt, 64)) as Buffer;
    return `${salt}.${buf.toString("hex")}`;
  }

  /**
   * Verifies a password against a stored hash
   * @param storedHash - Stored password hash in format: salt.hash
   * @param suppliedPassword - Plain text password to verify
   * @returns True if password matches, false otherwise
   */
  private async verifyPassword(
    storedHash: string,
    suppliedPassword: string,
  ): Promise<boolean> {
    const [salt, hash] = storedHash.split(".");
    if (!salt || !hash) {
      return false;
    }
    const buf = (await scryptAsync(suppliedPassword, salt, 64)) as Buffer;
    return timingSafeEqual(Buffer.from(hash, "hex"), buf);
  }

  /**
   * Gets the JWT secret from environment variable
   * @returns JWT secret
   * @throws Error if JWT_SECRET is not configured
   */
  private getJwtSecret(): Uint8Array {
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error("JWT_SECRET environment variable is not configured");
    }
    return new TextEncoder().encode(secret);
  }

  /**
   * Fetches active roles for a user
   * @param userId - User ID
   * @returns Array of active role IDs
   */
  private async fetchUserRoles(userId: string): Promise<ManagementUserRole[]> {
    const roles = await db
      .select()
      .from(managementUserRoleTable)
      .where(
        and(
          eq(managementUserRoleTable.userId, userId),
          isNull(managementUserRoleTable.revokedAt),
        ),
      );

    return roles.map((role) => role.roleId) as ManagementUserRole[];
  }

  /**
   * Registers a new user with email and password
   * @param email - User email address
   * @param password - Plain text password
   * @returns Result with void on success or error message on failure
   */
  public async registerUser(
    email: string,
    password: string,
  ): Promise<Result<void, string>> {
    try {
      // Hash the password
      const passwordHash = await this.hashPassword(password);

      // Insert the new user
      await db.insert(managementUserTable).values({
        email,
        passwordHash,
      });

      return { success: true, data: undefined };
    } catch (error: any) {
      // Check for unique constraint violation (duplicate email)
      if (error.code === "23505" || error.constraint === "management_user_email_unique") {
        return { success: false, errors: "Email address already registered" };
      }
      
      console.error("Error registering user:", error);
      return { success: false, errors: "Failed to register user" };
    }
  }

  /**
   * Authenticates and verifies a JWT token
   * @param token - JWT token string
   * @returns Result with token payload on success or error message on failure
   */
  public async authenticateToken(
    token: string,
  ): Promise<Result<ManagementAuthTokenPayload, string>> {
    try {
      const secret = this.getJwtSecret();
      const { payload } = await jwtVerify(token, secret);

      // Validate payload structure
      if (
        typeof payload.userId !== "string" ||
        typeof payload.salonId !== "string" ||
        !Array.isArray(payload.roles)
      ) {
        return { success: false, errors: "Invalid token payload" };
      }

      return {
        success: true,
        data: {
          userId: payload.userId,
          salonId: payload.salonId,
          roles: payload.roles as ManagementUserRole[],
        },
      };
    } catch (error: any) {
      console.error("Error verifying token:", error);
      if (error.code === "ERR_JWT_EXPIRED") {
        return { success: false, errors: "Token has expired" };
      }
      return { success: false, errors: "Invalid or malformed token" };
    }
  }

  /**
   * Authenticates user with email and password, returns JWT token
   * @param email - User email address
   * @param password - Plain text password
   * @returns Result with JWT token on success or error message on failure
   */
  public async authenticateCredentials(
    email: string,
    password: string,
  ): Promise<Result<string, string>> {
    try {
      // Find user by email
      const [user] = await db
        .select()
        .from(managementUserTable)
        .where(eq(managementUserTable.email, email));

      if (!user) {
        return { success: false, errors: "Invalid email or password" };
      }

      // Verify password
      const passwordValid = await this.verifyPassword(
        user.passwordHash,
        password,
      );

      if (!passwordValid) {
        return { success: false, errors: "Invalid email or password" };
      }

      // Fetch user roles
      const roles = await this.fetchUserRoles(user.id);

      // Generate JWT token
      const secret = this.getJwtSecret();
      const expires = new Date(Date.now() + 1000 * 60 * 60 * 24); // 1 day

      const token = await new SignJWT({
        userId: user.id,
        salonId: user.salonId || "",
        roles,
      })
        .setProtectedHeader({ alg: "HS256" })
        .setExpirationTime(expires)
        .sign(secret);

      return { success: true, data: token };
    } catch (error: any) {
      console.error("Error authenticating credentials:", error);
      return { success: false, errors: "Authentication failed" };
    }
  }

  /**
   * Binds a salon to a user
   * @param userId - User ID
   * @param salonId - Salon ID
   * @returns Result with void on success or error message on failure
   */
  public async bindSalonToUser(
    userId: string,
    salonId: string,
  ): Promise<Result<void, string>> {
    try {
      // Update user with salonId
      const result = await db
        .update(managementUserTable)
        .set({ salonId })
        .where(eq(managementUserTable.id, userId))
        .returning();

      if (result.length === 0) {
        return { success: false, errors: "User not found" };
      }

      return { success: true, data: undefined };
    } catch (error: any) {
      console.error("Error binding salon to user:", error);
      return { success: false, errors: "Failed to bind salon to user" };
    }
  }
}
