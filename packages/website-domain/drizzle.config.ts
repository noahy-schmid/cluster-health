import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Support for deployment prefixes (PR deployments, staging, etc.)
const deploymentPrefix = process.env.DEPLOYMENT_PREFIX || "";

// Get schema name with optional prefix
// For website-domain, we use 'public' as base schema, but with prefix it becomes just the prefix
const getSchemaName = (): string => {
  if (!deploymentPrefix) {
    return "public";
  }
  return `${deploymentPrefix}_website`;
};

const schemaName = getSchemaName();

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  // Only use schemaFilter if not using public schema
  ...(schemaName !== "public" ? { schemaFilter: [schemaName] } : {}),
});
