import { Effect, Layer } from "effect";
import {
  Configuration,
  type Configuration as ConfigurationType,
} from "./config.interface";
import { ConfigurationError } from "../types/errors";

function deriveDatabaseName(deployUrl: string): string {
  const parsed = new URL(deployUrl);
  let sanitized = parsed.hostname.toLowerCase().replace(/[^a-z0-9]/g, "_");
  if (/^[0-9]/.test(sanitized)) {
    sanitized = `_${sanitized}`;
  }
  return sanitized.slice(0, 63) || "preview_db";
}

function buildDatabaseUrl(): string {
  const url = process.env.DATABASE_URL;
  const user = process.env.DATABASE_USER;
  const password = process.env.DATABASE_PASSWORD;

  if (!url || !user || !password) {
    throw new Error(
      "DATABASE_URL, DATABASE_USER, and DATABASE_PASSWORD environment variables must be set",
    );
  }

  let dbName = process.env.DATABASE_NAME;

  if (!dbName) {
    if (process.env.DEPLOYMENT_CONTEXT === "development") {
      const deployUrl = process.env.DOKPLOY_DEPLOY_URL;
      if (!deployUrl) {
        throw new Error(
          "DOKPLOY_DEPLOY_URL must be set when DEPLOYMENT_CONTEXT=development and DATABASE_NAME is not provided",
        );
      }
      dbName = deriveDatabaseName(deployUrl);
    } else {
      throw new Error("DATABASE_NAME environment variable must be set");
    }
  }

  const parsedUrl = new URL(url);
  parsedUrl.username = user;
  parsedUrl.password = password;
  parsedUrl.pathname = `/${dbName}`;

  return parsedUrl.toString();
}

const makeConfiguration = Effect.gen(function* () {
  const databaseUrl = yield* Effect.try({
    try: () => buildDatabaseUrl(),
    catch: (error) =>
      new ConfigurationError({
        message: error instanceof Error ? error.message : String(error),
      }),
  });

  const config: ConfigurationType = {
    databaseUrl,
  };

  return config;
});

export const ConfigurationLayer = Layer.effect(
  Configuration,
  makeConfiguration,
);
