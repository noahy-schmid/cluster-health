import { Pool } from "pg";
import { e2eEnvironment } from "../env";

const TEST_SCHEMAS = ["auth", "salon", "website"] as const;

export async function resetDatabase(): Promise<void> {
  const pool = new Pool({
    connectionString: e2eEnvironment.databaseUrl,
  });

  try {
    const result = await pool.query<{ qualified_name: string }>(
      `
        SELECT format('%I.%I', schemaname, tablename) AS qualified_name
        FROM pg_tables
        WHERE schemaname = ANY($1::text[])
        ORDER BY schemaname, tablename
      `,
      [TEST_SCHEMAS],
    );

    if (result.rows.length === 0) {
      throw new Error(
        "No tables were found in the auth, salon, or website schemas. Ensure the schemas exist and run `pnpm e2e:prepare` from the monorepo root directory to initialize the tables.",
      );
    }

    await pool.query(
      `TRUNCATE TABLE ${result.rows
        .map((row) => row.qualified_name)
        .join(", ")} RESTART IDENTITY CASCADE`,
    );
  } finally {
    await pool.end();
  }
}
