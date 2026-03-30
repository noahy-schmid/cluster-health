import { Effect, Layer } from "effect";
import { buildDatabaseUrl } from "@repo/infrastructure-deployment";
import {
  Configuration,
  type Configuration as ConfigurationType,
} from "./config.interface";
import { ConfigurationError } from "../types/errors";

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
