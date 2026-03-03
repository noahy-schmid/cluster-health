"use server";

import { Effect } from "effect";
import { MediaService, MediaLayer } from "@repo/salon-domain";
import type { MediaFile as BackendMediaFile } from "@repo/salon-domain/src/ports/media.port";
import { SalonAccessGuard } from "@/api/guards/salon.guard";

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

export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; errors: E };

const mapBackendMediaFile = (file: BackendMediaFile): MediaFile => ({
  id: file.id,
  salonId: file.salonId,
  fileName: file.fileName,
  mimeType: file.mimeType,
  fileSize: file.fileSize,
  s3Key: file.s3Key,
  uploadConfirmed: file.uploadConfirmed,
  createdAt: file.createdAt,
});

export async function prepareMediaUpload(
  salonId: string,
  fileName: string,
  mimeType: string,
  fileSize: number,
): Promise<
  Result<{
    mediaId: string;
    uploadUrl: string;
    uploadFields: Record<string, string>;
  }>
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const effect = Effect.gen(function* () {
    const mediaService = yield* MediaService;
    return yield* mediaService
      .prepareUpload({ salonId, fileName, mimeType, fileSize })
      .pipe(
        Effect.map((data) => ({ success: true as const, data })),
        Effect.tapError((error) =>
          Effect.log(`Error preparing media upload: ${error.message}`),
        ),
        Effect.catchTag("MediaValidationError", (error) =>
          Effect.succeed({
            success: false as const,
            errors: error.message,
          }),
        ),
        Effect.catchTag("MediaError", (error) =>
          Effect.succeed({
            success: false as const,
            errors: error.message,
          }),
        ),
        Effect.catchTag("S3Error", (error) =>
          Effect.succeed({
            success: false as const,
            errors: error.message,
          }),
        ),
      );
  }).pipe(Effect.provide(MediaLayer));

  return await Effect.runPromise(effect);
}

export async function confirmMediaUpload(
  mediaId: string,
): Promise<Result<void>> {
  const effect = Effect.gen(function* () {
    const mediaService = yield* MediaService;
    return yield* mediaService.confirmUpload(mediaId).pipe(
      Effect.map(() => ({ success: true as const, data: undefined })),
      Effect.catchTag("MediaNotFoundError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `Media not found: ${error.mediaId}`,
        }),
      ),
      Effect.catchTag("MediaError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
      Effect.catchTag("S3Error", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
    );
  }).pipe(Effect.provide(MediaLayer));

  return await Effect.runPromise(effect);
}

export async function listMedia(salonId: string): Promise<Result<MediaFile[]>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const effect = Effect.gen(function* () {
    const mediaService = yield* MediaService;
    return yield* mediaService.listMedia(salonId).pipe(
      Effect.map((files) => ({
        success: true as const,
        data: files.map(mapBackendMediaFile),
      })),
      Effect.catchTag("MediaError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
      Effect.catchTag("S3Error", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
    );
  }).pipe(Effect.provide(MediaLayer));

  return await Effect.runPromise(effect);
}

export async function deleteMedia(
  salonId: string,
  mediaId: string,
): Promise<Result<void>> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) {
    return { success: false, errors: access.error };
  }

  const effect = Effect.gen(function* () {
    const mediaService = yield* MediaService;
    return yield* mediaService.deleteMedia(mediaId, salonId).pipe(
      Effect.map(() => ({ success: true as const, data: undefined })),
      Effect.catchTag("MediaNotFoundError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `Media not found: ${error.mediaId}`,
        }),
      ),
      Effect.catchTag("MediaError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
      Effect.catchTag("S3Error", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
    );
  }).pipe(Effect.provide(MediaLayer));

  return await Effect.runPromise(effect);
}

export async function getMediaUrl(mediaId: string): Promise<Result<string>> {
  const effect = Effect.gen(function* () {
    const mediaService = yield* MediaService;
    return yield* mediaService.getMediaUrl(mediaId).pipe(
      Effect.map((data) => ({ success: true as const, data })),
      Effect.catchTag("MediaNotFoundError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: `Media not found: ${error.mediaId}`,
        }),
      ),
      Effect.catchTag("MediaError", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
      Effect.catchTag("S3Error", (error) =>
        Effect.succeed({
          success: false as const,
          errors: error.message,
        }),
      ),
    );
  }).pipe(Effect.provide(MediaLayer));

  return await Effect.runPromise(effect);
}
