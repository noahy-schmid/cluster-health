/**
 * Database configuration utility
 * Builds DATABASE_URL from component parts and handles preview deployment database naming
 */

interface DatabaseConfig {
  host: string;
  port: string;
  user: string;
  password: string;
  database: string;
}

/**
 * Extracts database name from DOKPLOY_DEPLOY_URL
 * Format: https://pr-123-subdomain.domain.com -> pr-123
 * Returns null if URL is invalid or not a preview deployment
 */
function extractDatabaseNameFromDeployUrl(
  deployUrl: string | undefined,
): string | null {
  if (!deployUrl) return null;

  try {
    const url = new URL(deployUrl);
    const hostname = url.hostname;

    // Check if this is a preview deployment (starts with pr-)
    const match = hostname.match(/^(pr-\d+)/);
    if (match) {
      return match[1].replace(/-/g, "_"); // pr-123 -> pr_123 (PostgreSQL naming)
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Gets the database configuration from environment variables
 */
export function getDatabaseConfig(): DatabaseConfig {
  const nodeEnv = process.env.NODE_ENV || "development";
  const dokployDeployUrl = process.env.DOKPLOY_DEPLOY_URL;

  // Get base configuration from environment
  const host = process.env.DATABASE_HOST || "localhost";
  const port = process.env.DATABASE_PORT || "5432";
  const user = process.env.DATABASE_USER || "postgres";
  const password = process.env.DATABASE_PASSWORD || "postgres";
  let database = process.env.DATABASE_DATABASE || "deinsalon";

  // For development environment with DOKPLOY_DEPLOY_URL, use preview database
  if (nodeEnv === "development" && dokployDeployUrl) {
    const previewDb = extractDatabaseNameFromDeployUrl(dokployDeployUrl);
    if (previewDb) {
      database = previewDb;
      console.log(
        `📍 Preview deployment detected: using database "${database}"`,
      );
    }
  }

  return { host, port, user, password, database };
}

/**
 * Builds DATABASE_URL from configuration
 */
export function buildDatabaseUrl(config?: DatabaseConfig): string {
  const dbConfig = config || getDatabaseConfig();
  return `postgresql://${dbConfig.user}:${dbConfig.password}@${dbConfig.host}:${dbConfig.port}/${dbConfig.database}`;
}

/**
 * Gets the effective DATABASE_URL
 * Falls back to DATABASE_URL env var if provided, otherwise builds from components
 */
export function getDatabaseUrl(): string {
  // If DATABASE_URL is explicitly provided, use it
  if (process.env.DATABASE_URL) {
    return process.env.DATABASE_URL;
  }

  // Otherwise, build from components
  return buildDatabaseUrl();
}
