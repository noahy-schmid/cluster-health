import {
  PostgreSqlContainer,
  StartedPostgreSqlContainer,
} from "@testcontainers/postgresql";
import * as pg from "pg";

const { Pool } = pg;

export interface PostgreSQLTestContainer {
  container: StartedPostgreSqlContainer;
  databaseUrl: string;
  client: InstanceType<typeof Pool>;
  stop: () => Promise<void>;
}

let cachedContainer: PostgreSQLTestContainer | null = null;

export async function getOrCreatePostgreSQLContainer(): Promise<PostgreSQLTestContainer> {
  if (cachedContainer) {
    return cachedContainer;
  }

  const container = await new PostgreSqlContainer("postgres:16")
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  const client = new Pool({
    connectionString: databaseUrl,
  });

  cachedContainer = {
    container,
    databaseUrl,
    client,
    stop: async () => {
      await client.end();
      await container.stop();
      cachedContainer = null;
    },
  };

  return cachedContainer;
}

export async function createPostgreSQLContainer(): Promise<PostgreSQLTestContainer> {
  const container = await new PostgreSqlContainer("postgres:16")
    .withDatabase("test")
    .withUsername("test")
    .withPassword("test")
    .start();

  const databaseUrl = container.getConnectionUri();

  const client = new Pool({
    connectionString: databaseUrl,
  });

  return {
    container,
    databaseUrl,
    client,
    stop: async () => {
      await client.end();
      await container.stop();
    },
  };
}
