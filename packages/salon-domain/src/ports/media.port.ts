import { Context, Data, Effect } from "effect";

<<<<<<<< HEAD:packages/salon-domain/src/ports/media.port.ts
export type SelectDatabaseMediaFile = typeof mediaFilesTable.$inferSelect;
export type InsertDatabaseMediaFile = typeof mediaFilesTable.$inferInsert;

export interface MediaFile {
  id: string;
  salonId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  uploadConfirmed: boolean;
  createdAt: Date;
}

export interface PrepareUploadInput {
  salonId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
}

export interface PrepareUploadOutput {
  mediaId: string;
  uploadUrl: string;
  uploadFields: Record<string, string>;
}

export interface MediaPort {
  insertMediaFile(
    input: InsertDatabaseMediaFile,
  ): Effect.Effect<void, MediaError | S3Error, never>;

  updateMediaFileUploadConfirmed(
    mediaId: string,
    confirmed: boolean,
  ): Effect.Effect<void, MediaError | S3Error, never>;

  findMediaFileById(
    mediaId: string,
  ): Effect.Effect<SelectDatabaseMediaFile | null, MediaError | S3Error, never>;

  findMediaFilesBySalonId(
    salonId: string,
  ): Effect.Effect<SelectDatabaseMediaFile[], MediaError | S3Error, never>;

  deleteMediaFile(
    mediaId: string,
  ): Effect.Effect<void, MediaError | S3Error, never>;
========
export class MediaPortError extends Data.TaggedError("MediaPortError")<{
  readonly message: string;
}> {}

export interface MediaPort {
  mediaIdsExist(mediaIds: string[]): Effect.Effect<boolean, MediaPortError>;
>>>>>>>> af7e228 (Merge branch '57-file-management' into copilot/refactor-sections-structure):packages/website-database/src/ports/media.port.ts
}

export const MediaPort = Context.GenericTag<MediaPort>(
  "@repo/salon-domain/MediaPort",
);
