import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { buildDatabaseUrl } from "@repo/infrastructure-deployment";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: buildDatabaseUrl(),
  },
  schemaFilter: ["salon"],
});
