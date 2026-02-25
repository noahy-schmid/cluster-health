import { Context, Effect } from "effect";
import type { S3Error } from "../types/media-errors";

export interface PresignedPostPolicy {
  bucket: string;
  key: string;
  conditions: Array<[string, ...unknown[]]>;
  expires: number;
}

export interface PresignedPostOutput {
  url: string;
  fields: Record<string, string>;
}

export interface HeadObjectOutput {
  contentLength: number;
  contentType: string;
}

export interface FileStoragePort {
  createPresignedPost(
    policy: PresignedPostPolicy,
  ): Effect.Effect<PresignedPostOutput, S3Error, never>;

  headObject(
    bucket: string,
    key: string,
  ): Effect.Effect<HeadObjectOutput, S3Error, never>;

  deleteObject(
    bucket: string,
    key: string,
  ): Effect.Effect<void, S3Error, never>;

  ensureBucketExists(bucket: string): Effect.Effect<void, S3Error, never>;
}

export const FileStoragePort = Context.GenericTag<FileStoragePort>(
  "@repo/website-database/FileStoragePort",
);
