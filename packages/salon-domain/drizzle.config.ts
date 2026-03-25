import "dotenv/config";
import { defineConfig } from "drizzle-kit";

// Support for deployment prefixes (PR deployments, staging, etc.)
const deploymentPrefix = process.env.DEPLOYMENT_PREFIX || "";

// Get schema name with optional prefix
const getSchemaName = (baseSchema: string): string => {
  if (!deploymentPrefix) {
    return baseSchema;
  }
  return `${deploymentPrefix}_${baseSchema}`;
};

const schemaName = getSchemaName("salon");

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
  schemaFilter: [schemaName],
});
