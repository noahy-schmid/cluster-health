import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { config as loadEnv } from "dotenv";

const currentFilePath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(currentFilePath), "..");

// Load environment variables
const envPath = path.join(rootDir, ".env");
if (fs.existsSync(envPath)) {
  loadEnv({ path: envPath });
}

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is missing. Cannot run migrations.");
  process.exit(1);
}

// Get deployment prefix for PR/staging deployments
// For PR deployments: DEPLOYMENT_PREFIX=pr-123
// For staging: DEPLOYMENT_PREFIX=staging
// For production: No prefix (or empty string)
const deploymentPrefix = process.env.DEPLOYMENT_PREFIX || "";

const validatePrefix = (prefix: string): boolean => {
  if (!prefix) return true;
  // Prefix should be alphanumeric with hyphens and underscores only
  return /^[a-z0-9_-]+$/i.test(prefix);
};

if (!validatePrefix(deploymentPrefix)) {
  console.error(
    `❌ Invalid DEPLOYMENT_PREFIX: "${deploymentPrefix}". Must be alphanumeric with hyphens/underscores only.`,
  );
  process.exit(1);
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

const migrateDomain = (domain: { name: string; path: string }) => {
  console.log(`\n📦 Migrating ${domain.name}...`);

  const domainPath = path.join(rootDir, domain.path);
  const migrationsFolder = path.join(domainPath, "drizzle");

  if (!fs.existsSync(migrationsFolder)) {
    console.log(`   ⚠️  No migrations folder found, skipping.`);
    return;
  }

  try {
    // Run drizzle-kit push command for this domain
    // This uses the db:push script from the domain's package.json
    console.log(`   Pushing schema changes for ${domain.name}...`);

    // Pass through all environment variables including DEPLOYMENT_PREFIX
    const env = {
      ...process.env,
      DATABASE_URL: databaseUrl,
      DEPLOYMENT_PREFIX: deploymentPrefix,
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

const main = () => {
  console.log("🚀 Starting database migrations...");

  if (deploymentPrefix) {
    console.log(`📍 Deployment prefix: "${deploymentPrefix}"`);
    console.log(
      `   Schemas will use prefixed names for PR/staging deployments`,
    );
  } else {
    console.log(`📍 No deployment prefix - using default schema names`);
  }

  try {
    // Migrate all domains sequentially
    for (const domain of domains) {
      migrateDomain(domain);
    }

    console.log("\n✅ All migrations completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exitCode = 1;
  }
};

main();
