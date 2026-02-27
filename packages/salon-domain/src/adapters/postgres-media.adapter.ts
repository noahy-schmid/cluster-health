import { Effect, Layer } from "effect";
import { MediaPort, type InsertDatabaseMediaFile } from "../ports/media.port";
import { MediaError, S3Error } from "../types/media-errors";
import { mediaFilesTable } from "../schema";
import { eq } from "drizzle-orm";
import { Database } from "../infrastructure/database.interface";

const makeMediaPort = Effect.gen(function* () {
  yield* Effect.log("Initializing PostgresMediaAdapter");

  const { db } = yield* Database;

  const insertMediaFile = (input: InsertDatabaseMediaFile) =>
    Effect.tryPromise(() => db.insert(mediaFilesTable).values(input)).pipe(
      Effect.mapError(
        (error) =>
          new MediaError({
            message: "Failed to insert media file record",
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
          new MediaError({
            message: `Failed to fetch media file: ${error}`,
          }),
      ),
    );

  const findMediaFilesBySalonId = (salonId: string) =>
    Effect.tryPromise(() =>
      db
        .select()
        .from(mediaFilesTable)
        .where(eq(mediaFilesTable.salonId, salonId)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new MediaError({
            message: `Failed to list media files for salon: ${error}`,
          }),
      ),
    );

  const deleteMediaFile = (mediaId: string) =>
    Effect.tryPromise(() =>
      db.delete(mediaFilesTable).where(eq(mediaFilesTable.id, mediaId)),
    ).pipe(
      Effect.mapError(
        (error) =>
          new MediaError({
            message: "Failed to delete media file record",
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
          new MediaError({
            message: "Failed to update media file upload confirmed status",
          }),
      ),
    );

  return {
    insertMediaFile,
    findMediaFileById,
    findMediaFilesBySalonId,
    deleteMediaFile,
    updateMediaFileUploadConfirmed,
  } satisfies MediaPort;
});

export const PostgresMediaAdapter = Layer.effect(MediaPort, makeMediaPort);
