import { Context } from "effect";

export interface Configuration {
  databaseUrl: string;
  s3Url: string;
  s3Region: string;
  s3AccessKey: string;
  s3SecretKey: string;
  s3BucketName: string;
}

export const Configuration = Context.GenericTag<Configuration>(
  "@config/website-database/Configuration",
);
