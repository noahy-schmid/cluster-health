import { createHash } from "node:crypto";

const PREVIEW_DEPLOYMENT_CONTEXT = "development";
const PREVIEW_DATABASE_PREFIX = "preview_";
const PREVIEW_DATABASE_HASH_LENGTH = 20;

const normalizeDeployUrl = (deployUrl: string): string =>
  deployUrl.includes("://") ? deployUrl : `https://${deployUrl}`;

/**
 * Returns true when the deployment context denotes an ephemeral preview environment.
 */
export const isPreviewDeployment = (
  deploymentContext: string | undefined,
): boolean => deploymentContext === PREVIEW_DEPLOYMENT_CONTEXT;

/**
 * Derives a deterministic hash for a preview deployment hostname.
 */
export const derivePreviewDeploymentHash = (deployUrl: string): string => {
  const parsed = new URL(normalizeDeployUrl(deployUrl));

  return createHash("sha256")
    .update(parsed.hostname.toLowerCase())
    .digest("hex")
    .slice(0, PREVIEW_DATABASE_HASH_LENGTH);
};

/**
 * Derives a deterministic Postgres-compatible preview database name from the deployment URL hostname.
 */
export const derivePreviewDatabaseName = (deployUrl: string): string => {
  return `${PREVIEW_DATABASE_PREFIX}${derivePreviewDeploymentHash(deployUrl)}`;
};

/**
 * Builds a full database connection URL using the current process environment.
 */
export const buildDatabaseUrl = (): string => {
  const url = process.env.DATABASE_URL;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;

  if (!url || !user || !password) {
    throw new Error(
      "DATABASE_URL, DATABASE_USER, and DATABASE_PASSWORD environment variables must be set",
    );
  }

  let dbName = process.env.DATABASE_NAME;

  if (!dbName) {
    if (isPreviewDeployment(process.env.DEPLOYMENT_CONTEXT)) {
      const deployUrl = process.env.DOKPLOY_DEPLOY_URL;
      if (!deployUrl) {
        throw new Error(
          "DOKPLOY_DEPLOY_URL must be set when DEPLOYMENT_CONTEXT=development and DATABASE_NAME is not provided",
        );
      }
      dbName = derivePreviewDatabaseName(deployUrl);
    } else {
      throw new Error("DATABASE_NAME environment variable must be set");
    }
  }

  const parsedUrl = new URL(url);
  parsedUrl.username = user;
  parsedUrl.password = password;
  parsedUrl.pathname = `/${dbName}`;

  return parsedUrl.toString();
};
