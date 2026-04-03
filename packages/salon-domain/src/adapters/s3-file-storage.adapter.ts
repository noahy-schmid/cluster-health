import { Effect, Layer } from "effect";
import { FileStoragePort } from "../ports/file-storage.port";
import type {
  PresignedPostPolicy,
  PresignedPostOutput,
  HeadObjectOutput,
} from "../ports/file-storage.port";
import { S3Error } from "../types/media-errors";
import { Configuration } from "../infrastructure/config.interface";
import {
  S3Client,
  HeadBucketCommand,
  CreateBucketCommand,
  PutBucketPolicyCommand,
  PutBucketCorsCommand,
  HeadObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { createPresignedPost } from "@aws-sdk/s3-presigned-post";

const createS3Client = (
  s3Url: string,
  s3Region: string,
  s3AccessKey: string,
  s3SecretKey: string,
) => {
  const endpoint = s3Url ? { endpoint: s3Url } : {};
  return new S3Client({
    region: s3Region,
    credentials: {
      accessKeyId: s3AccessKey,
      secretAccessKey: s3SecretKey,
    },
    ...endpoint,
    forcePathStyle: true,
  });
};

const buildBucketPolicy = (
  policyTemplate: string,
  bucket: string,
  s3Principal: string,
) =>
  policyTemplate
    .split("{{bucket}}")
    .join(bucket)
    .split("{{s3Principal}}")
    .join(s3Principal);

const makeFileStoragePort = Effect.gen(function* () {
  const config = yield* Configuration;

  const s3Client = createS3Client(
    config.s3Url,
    config.s3Region,
    config.s3AccessKey,
    config.s3SecretKey,
  );

  const corsAllowedOrigins =
    config.nodeEnv === "production" ? config.s3AllowDomains : ["*"];

  const createPresignedPostImpl = (policy: PresignedPostPolicy) =>
    Effect.gen(function* () {
      const output = yield* Effect.tryPromise(() =>
        createPresignedPost(s3Client, {
          Bucket: policy.bucket,
          Key: policy.key,
          Conditions: policy.conditions as (
            | ["starts-with", string, string]
            | ["eq", string, string]
            | ["content-length-range", number, number]
            | Record<string, string>
          )[],
          Expires: policy.expires,
        }),
      ).pipe(
        Effect.mapError(
          (error) =>
            new S3Error({
              message: "Failed to create presigned post URL",
              cause: error,
            }),
        ),
      );

      const result: PresignedPostOutput = {
        url: output.url,
        fields: output.fields,
      };
      return result;
    });

  const headObjectImpl = (bucket: string, key: string) =>
    Effect.gen(function* () {
      const response = yield* Effect.tryPromise(() =>
        s3Client.send(
          new HeadObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new S3Error({
              message: `Failed to head object: ${key}`,
              cause: error,
            }),
        ),
      );

      const result: HeadObjectOutput = {
        contentLength: response.ContentLength ?? 0,
        contentType: response.ContentType ?? "",
      };
      return result;
    });

  const deleteObjectImpl = (bucket: string, key: string) =>
    Effect.gen(function* () {
      yield* Effect.tryPromise(() =>
        s3Client.send(
          new DeleteObjectCommand({
            Bucket: bucket,
            Key: key,
          }),
        ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new S3Error({
              message: `Failed to delete object: ${key}`,
              cause: error,
            }),
        ),
      );
    });

  const ensureBucketExistsImpl = (bucket: string) =>
    Effect.gen(function* () {
      const exists = yield* Effect.tryPromise(() =>
        s3Client.send(new HeadBucketCommand({ Bucket: bucket })),
      ).pipe(
        Effect.map(() => true),
        Effect.catchAll(() => Effect.succeed(false)),
      );

      if (exists) {
        return;
      }

      yield* Effect.logInfo(
        `Bucket ${bucket} does not exist yet, creating it now`,
        bucket,
      );

      yield* Effect.tryPromise(() =>
        s3Client.send(
          new CreateBucketCommand({
            Bucket: bucket,
          }),
        ),
      ).pipe(
        Effect.tapError((error) =>
          Effect.logError(`Failed to create bucket: ${bucket}`, error),
        ),
      );

      yield* Effect.logInfo(`Bucket ${bucket} created successfully`, bucket);

      const bucketPolicy = buildBucketPolicy(
        config.s3BucketPolicyTemplate,
        bucket,
        config.s3Principal,
      );

      yield* Effect.tryPromise(() =>
        s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: bucket,
            Policy: bucketPolicy,
          }),
        ),
      ).pipe(
        Effect.tapError((error) =>
          Effect.logError(`Failed to set bucket policy for: ${bucket}`, error),
        ),
      );

      yield* Effect.logInfo(
        `Bucket policy set successfully for bucket: ${bucket}`,
        bucket,
      );

      yield* Effect.tryPromise(() =>
        s3Client.send(
          new PutBucketCorsCommand({
            Bucket: bucket,
            CORSConfiguration: {
              CORSRules: [
                {
                  AllowedOrigins: corsAllowedOrigins,
                  AllowedMethods: ["GET", "HEAD", "POST", "PUT", "DELETE"],
                  AllowedHeaders: ["*"],
                  ExposeHeaders: ["ETag"],
                  MaxAgeSeconds: 3000,
                },
              ],
            },
          }),
        ),
      ).pipe(
        Effect.tapError((error) =>
          Effect.logError(
            `Failed to set CORS policy for bucket: ${bucket}`,
            error,
          ),
        ),
        Effect.catchAll(() => {
          if (config.nodeEnv === "production") {
            return Effect.fail(
              new S3Error({
                message: `Failed to set CORS policy for bucket: ${bucket} in production environment, this is required for proper functioning of the media upload feature. Please check the error logs for more details.`,
              }),
            );
          } else {
            return Effect.logWarning(
              `Failed to set CORS policy for bucket: ${bucket}, but continuing anyway since we're not in production. This may cause issues with media uploads in development environments.`,
              bucket,
            );
          }
        }),
      );
    }).pipe(
      Effect.mapError(
        (error) =>
          new S3Error({
            message: `Failed to ensure bucket exists: ${bucket}`,
            cause: error,
          }),
      ),
    );

  return {
    createPresignedPost: createPresignedPostImpl,
    headObject: headObjectImpl,
    deleteObject: deleteObjectImpl,
    ensureBucketExists: ensureBucketExistsImpl,
  } satisfies FileStoragePort;
});

export const S3FileStorageAdapter = Layer.effect(
  FileStoragePort,
  makeFileStoragePort,
);
