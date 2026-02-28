import { Effect, Layer } from "effect";
import {
  Configuration,
  type Configuration as ConfigurationType,
} from "./config.interface";

const makeConfiguration = Effect.gen(function* () {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    return yield* Effect.die(
      new Error("DATABASE_URL environment variable is not defined"),
    );
  }

  const config: ConfigurationType = {
    databaseUrl,
    s3Url: process.env.S3_URL || "",
    s3Region: process.env.S3_REGION || "us-east-1",
    s3AccessKey: process.env.S3_SALON_ACCESS_KEY || "",
    s3SecretKey: process.env.S3_SALON_SECRET_KEY || "",
    s3BucketName: process.env.S3_WEBSITE_BUCKET_NAME || "salon-media",
  };

  return config;
});

export const ConfigurationLayer = Layer.effect(
  Configuration,
  makeConfiguration,
);
