import { ExtractTablesWithRelations } from "drizzle-orm";
import { drizzle, NodePgQueryResultHKT } from "drizzle-orm/node-postgres";
import { PgTransaction } from "drizzle-orm/pg-core";
import { buildDatabaseUrl } from "@repo/infrastructure-deployment";
import { Configuration } from "./infrastructure/config.interface";

let dbInstance: ReturnType<typeof drizzle> | undefined;

const getDbInstance = () => {
  if (dbInstance) {
    return dbInstance;
  }

  dbInstance = drizzle(buildDatabaseUrl());
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
