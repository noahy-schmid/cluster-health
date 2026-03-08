import { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { Configuration } from "./infrastructure/config.interface";

let dbInstance: ReturnType<typeof drizzle> | undefined;

const getConfig = () => {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error(
      "DATABASE_URL environment variable is not defined. Please set it in your .env file or environment configuration.",
    );
  }
  return databaseUrl;
};

const getDbInstance = () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = drizzle(getConfig());
  return dbInstance;
};

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

export const DatabaseConfig = Configuration;
