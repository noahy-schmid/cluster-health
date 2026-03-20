import type { DatabaseType, ServiceType } from "./coolify/types.js";

// --------------------------------------------------------------------------
// PR environment infrastructure service definitions
//
// These services are automatically provisioned alongside the application
// containers when a PR environment is created and cleaned up when the PR is
// closed.
//
// To add a new service in the future, append an entry to the relevant array:
//   • PR_DATABASE_SERVICES  – Coolify-managed databases (Postgres, Redis, …)
//   • PR_COOLIFY_SERVICES   – Coolify-managed service stacks (MinIO, …)
// --------------------------------------------------------------------------

/** A Coolify-managed database (e.g. PostgreSQL) provisioned per PR. */
export interface PrDatabaseService {
  /** Coolify database engine type. */
  readonly type: DatabaseType;
  /**
   * Suffix appended to the environment name to produce the resource name.
   * Example: type="postgresql", nameSuffix="postgres"
   * → resource name for PR #42 → "pr-42-postgres"
   */
  readonly nameSuffix: string;
}

/** A Coolify service stack (e.g. MinIO) provisioned per PR. */
export interface PrCoolifyService {
  /** Coolify service stack type. */
  readonly type: ServiceType;
  /** Suffix appended to the environment name to produce the resource name. */
  readonly nameSuffix: string;
}

/**
 * Databases that are provisioned for every PR environment.
 *
 * Add entries here to provision additional database types per PR.
 */
export const PR_DATABASE_SERVICES: readonly PrDatabaseService[] = [
  { type: "postgresql", nameSuffix: "postgres" },
];

/**
 * Coolify service stacks that are provisioned for every PR environment.
 *
 * Add entries here to provision additional services (MinIO S3, Redis, …)
 * per PR.
 */
export const PR_COOLIFY_SERVICES: readonly PrCoolifyService[] = [
  { type: "minio", nameSuffix: "minio" },
];
