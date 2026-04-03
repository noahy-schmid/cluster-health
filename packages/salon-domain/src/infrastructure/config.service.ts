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

function parseAllowDomains(rawValue: string): string[] {
  return rawValue
    .split(",")
    .map((domain) => domain.trim())
    .filter((domain) => domain.length > 0);
}

const makeConfiguration = Effect.gen(function* () {
  const databaseUrl = yield* Effect.try({
    try: () => buildDatabaseUrl(),
    catch: (error) =>
      new Error(error instanceof Error ? error.message : String(error)),
  });

  const nodeEnv = process.env.NODE_ENV || "development";
  const s3AllowDomains = parseAllowDomains(process.env.S3_ALLOW_DOMAINS || "");
  const s3BucketPolicyTemplate = process.env.S3_BUCKET_POLICY_TEMPLATE || "";

  if (nodeEnv === "production" && s3AllowDomains.length === 0) {
    yield* Effect.fail(
      new Error(
        "S3_ALLOW_DOMAINS must be set in production with a comma-separated list of allowed origins",
      ),
    );
  }

  if (!s3BucketPolicyTemplate) {
    yield* Effect.fail(
      new Error(
        "S3_BUCKET_POLICY_TEMPLATE must be set with a JSON policy string",
      ),
    );
  }

  const config: ConfigurationType = {
    databaseUrl,
    nodeEnv,
    isPreviewDeployment: isPreviewDeployment(process.env.DEPLOYMENT_CONTEXT),
    s3Url: process.env.S3_URL || "",
    s3Region: process.env.S3_REGION || "us-east-1",
    s3AccessKey: process.env.S3_SALON_ACCESS_KEY || "",
    s3SecretKey: process.env.S3_SALON_SECRET_KEY || "",
    s3BucketName: buildBucketName(process.env.S3_SALON_BUCKET || "salon-media"),
    s3Principal: process.env.S3_SALON_PRINCIPAL || "",
    s3BucketPolicyTemplate,
    s3AllowDomains,
  };

  return config;
});

export const ConfigurationLayer = Layer.effect(
  Configuration,
  makeConfiguration,
);
