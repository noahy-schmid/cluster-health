import { Effect, Layer } from "effect";
import {
  Configuration,
  type Configuration as ConfigurationType,
} from "./config.interface";
import { ConfigurationError } from "../types/errors";

const makeConfiguration = Effect.gen(function* () {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return yield* Effect.fail(
      new ConfigurationError({
        message: "DATABASE_URL environment variable is not defined",
      }),
    );
  }

  const config: ConfigurationType = {
    databaseUrl,
  };

  return config;
});

export const ConfigurationLayer = Layer.effect(
  Configuration,
  makeConfiguration,
);
