import { Effect } from "effect";
import { NodePgDatabase } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { Context } from "effect";

export interface Database {
  readonly db: NodePgDatabase;
  readonly pool: Pool;
  readonly endConnection?: Effect.Effect<void, Error>;
}

export const Database = Context.GenericTag<Database>(
  "@database/website-database/Database",
);
