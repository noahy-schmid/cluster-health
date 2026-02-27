import { Effect, Layer } from "effect";
import {
  MediaPort,
  type MediaFile,
  type InsertDatabaseMediaFile,
} from "../../ports/media.port";
import { FileStoragePort } from "../../ports/file-storage.port";
import {
  MediaError,
  MediaNotFoundError,
  MediaValidationError,
} from "../../types/media-errors";
import {
  MediaService,
  type PrepareUploadInput,
  type PrepareUploadOutput,
} from "./media.interface";
import { Configuration } from "../../infrastructure/config.interface";

const mapToMediaFile = (record: {
  id: string;
  salonId: string;
  fileName: string;
  mimeType: string;
  fileSize: number;
  s3Key: string;
  uploadConfirmed: boolean;
  createdAt: Date;
}): MediaFile => ({
  id: record.id,
  salonId: record.salonId,
  fileName: record.fileName,
  mimeType: record.mimeType,
  fileSize: record.fileSize,
  s3Key: record.s3Key,
  uploadConfirmed: record.uploadConfirmed,
  createdAt: record.createdAt,
});

const make = Effect.gen(function* () {
  const config = yield* Configuration;
  const mediaPort = yield* MediaPort;
  const fileStoragePort = yield* FileStoragePort;

  const prepareUpload = (input: PrepareUploadInput) =>
    Effect.gen(function* () {
      const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/x-icon",
        "image/ico",
      ];
      const maxFileSize = 10 * 1024 * 1024;

      if (!allowedMimeTypes.includes(input.mimeType)) {
        return yield* Effect.fail(
          new MediaValidationError({
            message: `Invalid mime type: ${input.mimeType}`,
          }),
        );
      }

      if (input.fileSize > maxFileSize) {
        return yield* Effect.fail(
          new MediaValidationError({
            message: `File size exceeds limit of ${maxFileSize} bytes`,
          }),
        );
      }

      const mediaId = crypto.randomUUID();
      const keyPrefix = `${input.salonId}/${mediaId}`;
      const s3Key = `${keyPrefix}/${input.fileName}`;

      yield* fileStoragePort.ensureBucketExists(config.s3BucketName);

      const presigned = yield* fileStoragePort.createPresignedPost({
        bucket: config.s3BucketName,
        key: s3Key,
        conditions: [
          ["content-length-range", 0, input.fileSize],
          ["starts-with", "$Content-Type", ""],
        ],
        expires: 300,
      });

      const dbRecord: InsertDatabaseMediaFile = {
        id: mediaId,
        salonId: input.salonId,
        fileName: input.fileName,
        mimeType: input.mimeType,
        fileSize: input.fileSize,
        s3Key,
        uploadConfirmed: false,
      };

      yield* mediaPort.insertMediaFile(dbRecord);

      const output: PrepareUploadOutput = {
        mediaId,
        uploadUrl: presigned.url,
        uploadFields: presigned.fields,
      };

      return output;
    });

  const confirmUpload = (mediaId: string) =>
    Effect.gen(function* () {
      const record = yield* mediaPort.findMediaFileById(mediaId);

      if (!record) {
        return yield* Effect.fail(new MediaNotFoundError({ mediaId }));
      }

      const headResult = yield* fileStoragePort
        .headObject(config.s3BucketName, record.s3Key)
        .pipe(
          Effect.catchTag("S3Error", () =>
            Effect.fail(
              new MediaError({
                message: "Failed to confirm upload: S3 headObject error",
              }),
            ),
          ),
        );

      if (headResult.contentLength !== record.fileSize) {
        yield* fileStoragePort.deleteObject(config.s3BucketName, record.s3Key);
        yield* mediaPort.deleteMediaFile(mediaId);
        return yield* Effect.fail(
          new MediaError({
            message: `File size mismatch: expected ${record.fileSize}, got ${headResult.contentLength}`,
          }),
        );
      }

      if (headResult.contentType !== record.mimeType) {
        yield* fileStoragePort.deleteObject(config.s3BucketName, record.s3Key);
        yield* mediaPort.deleteMediaFile(mediaId);
        return yield* Effect.fail(
          new MediaError({
            message: `Content type mismatch: expected ${record.mimeType}, got ${headResult.contentType}`,
          }),
        );
      }

      yield* mediaPort.updateMediaFileUploadConfirmed(mediaId, true);
    });

  const listMedia = (salonId: string) =>
    Effect.gen(function* () {
      const records = yield* mediaPort.findMediaFilesBySalonId(salonId);

      return records.map(mapToMediaFile);
    });

  const deleteMedia = (mediaId: string, salonId: string) =>
    Effect.gen(function* () {
      const record = yield* mediaPort.findMediaFileById(mediaId);

      if (!record || record.salonId !== salonId) {
        return yield* Effect.fail(
          new MediaError({
            message: "Unauthorized to delete media file",
          }),
        );
      }

      yield* fileStoragePort.deleteObject(config.s3BucketName, record.s3Key);

      yield* mediaPort.deleteMediaFile(mediaId);
    });

  const getMediaUrl = (mediaId: string) =>
    Effect.gen(function* () {
      const record = yield* mediaPort.findMediaFileById(mediaId);

      if (!record) {
        return yield* Effect.fail(new MediaNotFoundError({ mediaId }));
      }

      return `${config.s3Url}/${config.s3BucketName}/${record.s3Key}`;
    });

  const getMediaById = (mediaId: string) =>
    Effect.gen(function* () {
      const record = yield* mediaPort.findMediaFileById(mediaId);

      if (!record) {
        return yield* Effect.fail(new MediaNotFoundError({ mediaId }));
      }

      return mapToMediaFile(record);
    });

  return {
    prepareUpload,
    confirmUpload,
    listMedia,
    deleteMedia,
    getMediaUrl,
    getMediaById,
  } satisfies MediaService;
});

export const MediaServiceLive = Layer.effect(MediaService, make);
