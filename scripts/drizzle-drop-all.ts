import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { buildDatabaseUrl } from "@repo/infrastructure-deployment";

import { config as loadEnv } from "dotenv";
import { Client } from "pg";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");
const envPath = path.join(rootDir, ".env");

if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
}

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
  let databaseUrl: string;

  try {
    databaseUrl = buildDatabaseUrl();
  } catch (error) {
    console.error("Failed to build database URL. Aborting schema drop.", error);
    process.exit(1);
  }

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

const isEntrypoint =
  process.argv[1] !== undefined &&
  import.meta.url === pathToFileURL(process.argv[1]).href;

if (isEntrypoint) {
  void main();
}
