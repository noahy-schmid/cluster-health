import { Effect, Layer } from "effect";
import {
  Configuration,
  type Configuration as ConfigurationType,
} from "./config.interface";

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

export function derivePreviewBucketSuffix(deployUrl: string): string {
  const parsed = new URL(deployUrl);
  let sanitized = parsed.hostname.toLowerCase().replace(/[^a-z0-9-]/g, "-");
  sanitized = sanitized.replace(/-+/g, "-").replace(/^-|-$/g, "");

  if (!sanitized) {
    return "preview";
  }

  if (!/^[a-z0-9]/.test(sanitized)) {
    sanitized = `p-${sanitized}`;
  }

  if (!/[a-z0-9]$/.test(sanitized)) {
    sanitized = `${sanitized}0`;
  }

  return sanitized;
}

function buildBucketName(baseBucketName: string): string {
  const isPreviewDeployment = process.env.DEPLOYMENT_CONTEXT === "development";

  if (!isPreviewDeployment) {
    return baseBucketName;
  }

  const deployUrl = process.env.DOKPLOY_DEPLOY_URL;
  if (!deployUrl) {
    throw new Error(
      "DOKPLOY_DEPLOY_URL must be set when DEPLOYMENT_CONTEXT=development to derive preview S3 bucket name",
    );
  }

  const suffix = derivePreviewBucketSuffix(deployUrl);
  const maxBaseLength = 63 - suffix.length - 1;
  const trimmedBase = baseBucketName.slice(0, Math.max(1, maxBaseLength));
  return `${trimmedBase}-${suffix}`;
}

const makeConfiguration = Effect.gen(function* () {
  const databaseUrl = yield* Effect.try({
    try: () => buildDatabaseUrl(),
    catch: (error) =>
      new Error(error instanceof Error ? error.message : String(error)),
  });

  const config: ConfigurationType = {
    databaseUrl,
    isPreviewDeployment: process.env.DEPLOYMENT_CONTEXT === "development",
    s3Url: process.env.S3_URL || "",
    s3Region: process.env.S3_REGION || "us-east-1",
    s3AccessKey: process.env.S3_SALON_ACCESS_KEY || "",
    s3SecretKey: process.env.S3_SALON_SECRET_KEY || "",
    s3BucketName: buildBucketName(
      process.env.S3_WEBSITE_BUCKET_NAME || "salon-media",
    ),
  };

  return config;
});

export const ConfigurationLayer = Layer.effect(
  Configuration,
  makeConfiguration,
);
