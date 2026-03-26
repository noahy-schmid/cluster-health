import "dotenv/config";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { drizzle } from "drizzle-orm/node-postgres";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Pool } from "pg";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const workspaceRoot = path.resolve(__dirname, "../../../");

function deriveDatabaseName(deployUrl: string): string {
  const parsed = new URL(deployUrl);
  let sanitized = parsed.hostname.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (/^[0-9]/.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }
  return sanitized.slice(0, 63) || "preview_db";
}

function resolveDatabaseName(): string {
  let dbName = process.env.DATABASE_NAME;

  if (!dbName) {
    if (process.env.DEPLOYMENT_CONTEXT === "development") {
      const deployUrl = process.env.DOKPLOY_DEPLOY_URL;
      if (!deployUrl) {
        throw new Error(
          "DOKPLOY_DEPLOY_URL must be set when DEPLOYMENT_CONTEXT=development and DATABASE_NAME is not provided",
        );
      }
      dbName = deriveDatabaseName(deployUrl);
    } else {
      throw new Error("DATABASE_NAME environment variable must be set");
    }
  }

  return dbName;
}

function buildConnectionString(databaseName: string): string {
  const url = process.env.DATABASE_URL;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;

  if (!url || !user || !password) {
    throw new Error(
      "DATABASE_URL, DATABASE_USER, and DATABASE_PASSWORD environment variables must be set",
    );
  }

  const parsedUrl = new URL(url);
  parsedUrl.username = user;
  parsedUrl.password = password;
  parsedUrl.pathname = `/${databaseName}`;

  return parsedUrl.toString();
}

function quoteIdentifier(identifier: string): string {
  return `"${identifier.replace(/"/g, '""')}"`;
}

async function ensureDatabaseExists(databaseName: string): Promise<void> {
  const adminDatabaseName = process.env.DATABASE_ADMIN_DB ?? "postgres";
  const adminConnectionString = buildConnectionString(adminDatabaseName);
  const adminPool = new Pool({ connectionString: adminConnectionString });

  try {
    const result = await adminPool.query<{ exists: boolean }>(
      "SELECT EXISTS(SELECT 1 FROM pg_database WHERE datname = $1) AS exists",
      [databaseName],
    );

    if (result.rows[0]?.exists) {
      console.log(`Database \"${databaseName}\" already exists.`);
      return;
    }

    console.log(`Database \"${databaseName}\" does not exist. Creating...`);
    await adminPool.query(`CREATE DATABASE ${quoteIdentifier(databaseName)}`);
    console.log(`Database \"${databaseName}\" created successfully.`);
  } finally {
    await adminPool.end();
  }
}

const main = async () => {
  const databaseName = resolveDatabaseName();

  await ensureDatabaseExists(databaseName);

  const connectionString = buildConnectionString(databaseName);

  const pool = new Pool({ connectionString });
  const db = drizzle(pool);

  try {
    console.log("Running auth-domain migrations...");
    await migrate(db, {
      migrationsFolder: path.join(
        workspaceRoot,
        "packages/auth-domain/drizzle",
      ),
    });

    console.log("Running salon-domain migrations...");
    await migrate(db, {
      migrationsSchema: "drizzle",
      migrationsTable: "__drizzle_migrations_salon",
      migrationsFolder: path.join(
        workspaceRoot,
        "packages/salon-domain/drizzle",
      ),
    });

    console.log("Running website-domain migrations...");
    await migrate(db, {
      migrationsSchema: "drizzle",
      migrationsTable: "__drizzle_migrations_website",
      migrationsFolder: path.join(
        workspaceRoot,
        "packages/website-domain/drizzle",
      ),
    });

    console.log("All migrations completed successfully.");
  } catch (error) {
    console.error("Migration failed:", error);
    process.exitCode = 1;
  } finally {
    await pool.end();
  }
};

void main();
