import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { Client } from "pg";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");
const envPath = path.join(rootDir, ".env");

if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
}

function deriveDatabaseName(deployUrl: string): string {
  const parsed = new URL(deployUrl);
  let sanitized = parsed.hostname.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (/^[0-9]/.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }
  return sanitized.slice(0, 63) || "preview_db";
}

function buildDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;

  if (!url || !user || !password) {
    console.error(
      "DATABASE_URL, DATABASE_USER, and DATABASE_PASSWORD are missing. Aborting schema drop.",
    );
    process.exit(1);
  }

  let dbName = process.env.DATABASE_NAME;

  if (!dbName) {
    if (process.env.DEPLOYMENT_CONTEXT === "development") {
      const deployUrl = process.env.DOKPLOY_DEPLOY_URL;
      if (!deployUrl) {
        console.error(
          "DOKPLOY_DEPLOY_URL must be set when DEPLOYMENT_CONTEXT=development and DATABASE_NAME is not provided. Aborting schema drop.",
        );
        process.exit(1);
      }
      dbName = deriveDatabaseName(deployUrl);
    } else {
      console.error("DATABASE_NAME is missing. Aborting schema drop.");
      process.exit(1);
    }
  }

  const parsedUrl = new URL(url);
  parsedUrl.username = user;
  parsedUrl.password = password;
  parsedUrl.pathname = `/${dbName}`;

  return parsedUrl.toString();
}

const databaseUrl = buildDatabaseUrl();

if (process.env.NODE_ENV === "production") {
  console.error(
    "Refusing to run db:drop when NODE_ENV=production. Aborting schema drop.",
  );
  process.exit(1);
}

const allowNonLocalDbDrop = process.env.ALLOW_NON_LOCAL_DB_DROP === "1";

try {
  const parsedDatabaseUrl = new URL(databaseUrl);
  const localHosts = new Set(["localhost", "127.0.0.1", "::1"]);

  if (!allowNonLocalDbDrop && !localHosts.has(parsedDatabaseUrl.hostname)) {
    console.error(
      `Refusing to run db:drop against non-local host '${parsedDatabaseUrl.hostname}'. Set ALLOW_NON_LOCAL_DB_DROP=1 to override.`,
    );
    process.exit(1);
  }
} catch {
  console.error("Invalid database URL. Aborting schema drop.");
  process.exit(1);
}

const client = new Client({ connectionString: databaseUrl });

const dropAllSchemasSql = `
DO $$
DECLARE
  schema_name text;
BEGIN
  FOR schema_name IN
    SELECT nspname
    FROM pg_namespace
    WHERE nspname NOT IN ('pg_catalog', 'information_schema')
      AND nspname NOT LIKE 'pg_toast%'
      AND nspname NOT LIKE 'pg_temp_%'
  LOOP
    EXECUTE format('DROP SCHEMA IF EXISTS %I CASCADE', schema_name);
  END LOOP;
END
$$;

CREATE SCHEMA IF NOT EXISTS public;
`;

const main = async () => {
  try {
    await client.connect();
    await client.query(dropAllSchemasSql);
    console.log("Successfully dropped all non-system schemas.");
  } catch (error) {
    console.error("Failed to drop schemas.", error);
    process.exitCode = 1;
  } finally {
    await client.end();
  }
};

void main();
