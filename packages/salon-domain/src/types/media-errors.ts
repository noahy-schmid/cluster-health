import { Data } from "effect";

export class MediaError extends Data.TaggedError("MediaError")<{
  readonly message: string;
}> {}

export class MediaValidationError extends Data.TaggedError(
  "MediaValidationError",
)<{
  readonly message: string;
}> {}

export class MediaNotFoundError extends Data.TaggedError("MediaNotFoundError")<{
  readonly mediaId: string;
}> {}

export class S3Error extends Data.TaggedError("S3Error")<{
  readonly message: string;
  readonly cause?: unknown;
}> {}
