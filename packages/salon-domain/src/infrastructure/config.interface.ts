import { Context } from "effect";

export interface Configuration {
  databaseUrl: string;
  nodeEnv: string;
  isPreviewDeployment: boolean;
  s3Url: string;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3BucketName: string;
  s3Principal: string;
  s3BucketPolicyTemplate: string;
  s3AllowDomains: string[];
}

export const Configuration = Context.GenericTag<Configuration>(
  "@config/salon-domain/Configuration",
);
