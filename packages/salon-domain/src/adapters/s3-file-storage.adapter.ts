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

const makeFileStoragePort = Effect.gen(function* () {
  const config = yield* Configuration;

  const s3Client = createS3Client(
    config.s3Url,
    config.s3Region,
    config.s3AccessKey,
    config.s3SecretKey,
  );

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

      yield* Effect.tryPromise(() =>
        s3Client.send(
          new CreateBucketCommand({
            Bucket: bucket,
          }),
        ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new S3Error({
              message: `Failed to create bucket: ${bucket}`,
              cause: error,
            }),
        ),
      );

      const anonymousReadPolicy = {
        Version: "2012-10-17",
        Statement: [
          {
            Sid: "PublicReadGetObject",
            Effect: "Allow",
            Principal: "*",
            Action: ["s3:GetObject"],
            Resource: [`arn:aws:s3:::${bucket}/*`],
          },
        ],
      };

      yield* Effect.tryPromise(() =>
        s3Client.send(
          new PutBucketPolicyCommand({
            Bucket: bucket,
            Policy: JSON.stringify(anonymousReadPolicy),
          }),
        ),
      ).pipe(
        Effect.mapError(
          (error) =>
            new S3Error({
              message: `Failed to set bucket policy for: ${bucket}`,
              cause: error,
            }),
        ),
      );
    });

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
