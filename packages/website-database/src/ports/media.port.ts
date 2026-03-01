import { Context, Data, Effect } from "effect";

export class MediaPortError extends Data.TaggedError("MediaPortError")<{
  readonly message: string;
}> {}

export interface MediaPort {
  mediaIdsExist(mediaIds: string[]): Effect.Effect<boolean, MediaPortError>;
}

export const MediaPort = Context.GenericTag<MediaPort>(
  "@repo/website-database/MediaPort",
);
