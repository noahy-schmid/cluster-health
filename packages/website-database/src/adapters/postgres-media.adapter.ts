import { Effect, Layer } from "effect";
import { MediaPort, type InsertDatabaseMediaFile } from "../ports/media.port";
import { S3Error } from "../types/media-errors";
import { mediaFilesTable } from "../schema";
import { eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";

const makeMediaPort = Effect.gen(function* () {
  yield* Effect.log("Initializing MediaDatabaseAdapter");

  const { db } = yield* Database;

  const insertMediaFile = (input: InsertDatabaseMediaFile) =>
    Effect.tryPromise(() => db.insert(mediaFilesTable).values(input)).pipe(
      Effect.mapError(
        (error) =>
          new S3Error({
            message: "Failed to insert media file record",
            cause: error,
          }),
      ),
    );

  const findMediaFileById = (mediaId: string) =>
    Effect.tryPromise(() =>
      db
        .select()
        .from(mediaFilesTable)
        .where(eq(mediaFilesTable.id, mediaId))
        .limit(1),
    ).pipe(
      Effect.map((rows) => rows[0] ?? null),
      Effect.mapError(
        (error) =>
          new S3Error({
            message: `Failed to fetch media file: ${error}`,
            cause: error,
          }),
      ),
    );

  const findMediaFilesByWebsiteId = (websiteId: string) =>
    Effect.tryPromise(() =>
      db
        .select()
        .from(mediaFilesTable)
        .where(eq(mediaFilesTable.websiteId, websiteId)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new S3Error({
            message: `Failed to list media files for website: ${error}`,
            cause: error,
          }),
      ),
    );

  const deleteMediaFile = (mediaId: string) =>
    Effect.tryPromise(() =>
      db.delete(mediaFilesTable).where(eq(mediaFilesTable.id, mediaId)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new S3Error({
            message: "Failed to delete media file record",
            cause: error,
          }),
      ),
    );

  const updateMediaFileUploadConfirmed = (
    mediaId: string,
    confirmed: boolean,
  ) =>
    Effect.tryPromise(() =>
      db
        .update(mediaFilesTable)
        .set({ uploadConfirmed: confirmed })
        .where(eq(mediaFilesTable.id, mediaId)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new S3Error({
            message: "Failed to update media file upload confirmed status",
            cause: error,
          }),
      ),
    );

  return {
    insertMediaFile,
    findMediaFileById,
    findMediaFilesByWebsiteId,
    deleteMediaFile,
    updateMediaFileUploadConfirmed,
  } satisfies MediaPort;
});

export const PostgresMediaAdapter = Layer.effect(MediaPort, makeMediaPort);
