import { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";

let dbInstance: ReturnType<typeof drizzle> | undefined;

function getDbInstance() {
  if (dbInstance) {
    return dbInstance;
  }

  if (!process.env.DATABASE_URL) {
    throw new Error(
      "DATABASE_URL environment variable is not defined. Please set it in your .env file or environment configuration.",
    );
  }

  dbInstance = drizzle(process.env.DATABASE_URL);
  return dbInstance;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, property) {
    const instance = getDbInstance();
    const value = Reflect.get(instance as object, property, instance);

    return typeof value === "function" ? value.bind(instance) : value;
  },
});

export type Transaction = PgTransaction<
  NodePgQueryResultHKT,
  Record<string, never>,
  ExtractTablesWithRelations<Record<string, never>>
>;
