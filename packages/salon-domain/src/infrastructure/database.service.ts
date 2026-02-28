import { Effect, Layer } from "effect";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Configuration } from "./config.interface";
import { Database } from "./database.interface";

const makeDatabase = Effect.acquireRelease(
  Effect.gen(function* () {
    const config = yield* Configuration;

    const pool = new Pool({
      connectionString: config.databaseUrl,
      idleTimeoutMillis: 0,
      connectionTimeoutMillis: 1000,
    });

    const db = drizzle(pool);

    return { db, pool };
  }),
  ({ pool }) =>
    Effect.tryPromise({
      try: async () => {
        await pool.end();
      },
      catch: (error) => {
        throw error;
      },
    }),
);

export const DatabaseLayer = Layer.scoped(Database, makeDatabase);
