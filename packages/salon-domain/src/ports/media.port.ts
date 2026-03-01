import { Context, Effect } from "effect";
import { mediaFilesTable } from "../schema";
import { MediaError } from "../types/media-errors";

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
  ): Effect.Effect<void, MediaError, never>;

  updateMediaFileUploadConfirmed(
    mediaId: string,
    confirmed: boolean,
  ): Effect.Effect<void, MediaError, never>;

  findMediaFileById(
    mediaId: string,
  ): Effect.Effect<SelectDatabaseMediaFile | null, MediaError, never>;

  findMediaFilesBySalonId(
    salonId: string,
  ): Effect.Effect<SelectDatabaseMediaFile[], MediaError, never>;

  deleteMediaFile(mediaId: string): Effect.Effect<void, MediaError, never>;
}

export const MediaPort = Context.GenericTag<MediaPort>(
  "@repo/salon-domain/MediaPort",
);
