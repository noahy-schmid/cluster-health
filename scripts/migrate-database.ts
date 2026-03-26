import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";
import { Client } from "pg";

import { getDatabaseConfig, buildDatabaseUrl } from "./database-config";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");

// Load environment variables
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
}

const domains = [
  {
    name: "auth-domain",
    path: "packages/auth-domain",
  },
  {
    name: "salon-domain",
    path: "packages/salon-domain",
  },
  {
    name: "website-domain",
    path: "packages/website-domain",
  },
];

/**
 * Ensures the target database exists, creating it if necessary
 */
async function ensureDatabaseExists(
  dbConfig: ReturnType<typeof getDatabaseConfig>,
): Promise<void> {
  // Connect to postgres database to create target database if needed
  const adminUrl = buildDatabaseUrl({
    ...dbConfig,
    database: "postgres", // Connect to default postgres database
  });

  const client = new Client({ connectionString: adminUrl });

  try {
    await client.connect();

    // Check if database exists
    const result = await client.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbConfig.database],
    );

    if (result.rows.length === 0) {
      // Database doesn't exist, create it
      console.log(`📦 Creating database "${dbConfig.database}"...`);

      // CREATE DATABASE cannot be run in a transaction, so we use template0
      await client.query(
        `CREATE DATABASE "${dbConfig.database}" TEMPLATE template0 ENCODING 'UTF8'`,
      );

      console.log(`   ✅ Database "${dbConfig.database}" created successfully`);
    } else {
      console.log(`   ℹ️  Database "${dbConfig.database}" already exists`);
    }
  } catch (error) {
    console.error(`   ❌ Failed to ensure database exists:`, error);
    throw error;
  } finally {
    await client.end();
  }
}

const migrateDomain = (
  domain: { name: string; path: string },
  databaseUrl: string,
) => {
  console.log(`\n📦 Migrating ${domain.name}...`);

  const domainPath = path.join(rootDir, domain.path);
  const migrationsFolder = path.join(domainPath, "drizzle");

  if (!fs.existsSync(migrationsFolder)) {
    console.log(`   ⚠️  No migrations folder found, skipping.`);
    return;
  }

  try {
    // Run drizzle-kit push command for this domain
    console.log(`   Pushing schema changes for ${domain.name}...`);

    // Pass through all environment variables with the correct DATABASE_URL
    const env = {
      ...process.env,
      DATABASE_URL: databaseUrl,
    };

    execSync("pnpm db:push", {
      cwd: domainPath,
      env,
      stdio: "inherit",
    });

    console.log(`   ✅ Successfully migrated ${domain.name}`);
  } catch (error) {
    console.error(`   ❌ Failed to migrate ${domain.name}:`, error);
    throw error;
  }
};

const main = async () => {
  console.log("🚀 Starting database migrations...");

  // Get database configuration
  const dbConfig = getDatabaseConfig();
  const databaseUrl = buildDatabaseUrl(dbConfig);

  console.log(`📍 Database: ${dbConfig.database}`);
  console.log(`   Host: ${dbConfig.host}:${dbConfig.port}`);
  console.log(`   User: ${dbConfig.user}`);

  try {
    // Ensure the database exists
    await ensureDatabaseExists(dbConfig);

    // Migrate all domains sequentially
    for (const domain of domains) {
      migrateDomain(domain, databaseUrl);
    }

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exitCode = 1;
  }
};

main();
