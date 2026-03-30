import { Effect, Layer } from "effect";
import {
  buildDatabaseUrl,
  derivePreviewDeploymentHash,
  isPreviewDeployment,
} from "@repo/infrastructure-deployment";
import {
  Configuration,
  type Configuration as ConfigurationType,
} from "./config.interface";

function buildBucketName(baseBucketName: string): string {
  if (!isPreviewDeployment(process.env.DEPLOYMENT_CONTEXT)) {
    return baseBucketName;
  }

  const deployUrl = process.env.DOKPLOY_DEPLOY_URL;
  if (!deployUrl) {
    throw new Error(
      "DOKPLOY_DEPLOY_URL must be set when DEPLOYMENT_CONTEXT=development to derive preview S3 bucket name",
    );
  }

  const suffix = derivePreviewDeploymentHash(deployUrl);
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
    isPreviewDeployment: isPreviewDeployment(process.env.DEPLOYMENT_CONTEXT),
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
