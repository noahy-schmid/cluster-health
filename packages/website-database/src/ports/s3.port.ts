export {
  FileStoragePort,
  type PresignedPostPolicy,
  type PresignedPostOutput,
  type HeadObjectOutput,
} from "./file-storage.port";

import { Context } from "effect";

export type S3Port = import("./file-storage.port").FileStoragePort;

export const S3Port = Context.GenericTag<S3Port>(
  "@repo/website-database/S3Port",
);
