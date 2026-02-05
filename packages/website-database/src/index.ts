import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not defined. Please set it in your .env file or environment configuration."
  );
}

export const db = drizzle(process.env.DATABASE_URL);

export * from "./schema";
