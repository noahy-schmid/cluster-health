import { Context, Effect } from "effect";
import type {
  MediaError,
  MediaNotFoundError,
  MediaValidationError,
  S3Error,
} from "../../types/media-errors";
import type {
  MediaFile,
  PrepareUploadInput,
  PrepareUploadOutput,
} from "../../ports/media.port";

export type { PrepareUploadInput, PrepareUploadOutput };

export interface MediaService {
  prepareUpload(
    input: PrepareUploadInput,
  ): Effect.Effect<
    PrepareUploadOutput,
    MediaError | MediaNotFoundError | MediaValidationError | S3Error,
    never
  >;

  confirmUpload(
    mediaId: string,
  ): Effect.Effect<void, MediaError | MediaNotFoundError | S3Error, never>;

  listMedia(
    websiteId: string,
  ): Effect.Effect<MediaFile[], MediaError | S3Error, never>;

  deleteMedia(
    mediaId: string,
    websiteId: string,
  ): Effect.Effect<void, MediaError | MediaNotFoundError | S3Error, never>;

  getMediaUrl(
    mediaId: string,
  ): Effect.Effect<string, MediaError | MediaNotFoundError | S3Error, never>;

  getMediaById(
    mediaId: string,
  ): Effect.Effect<MediaFile, MediaNotFoundError | MediaError | S3Error, never>;
}

export const MediaService = Context.GenericTag<MediaService>(
  "@repo/website-database/MediaService",
);
