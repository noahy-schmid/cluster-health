import { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL environment variable is not defined. Please set it in your .env file or environment configuration.",
  );
}

export const db = drizzle(process.env.DATABASE_URL);

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
