import { Effect, Layer } from "effect";
import { MediaService } from "@repo/salon-domain";
import {
  MediaPort,
  MediaPortError,
  type MediaPort as MediaPortType,
} from "../ports/media.port";

const make = Effect.gen(function* () {
  yield* Effect.succeed(undefined);

  const mediaService = yield* MediaService;

  const mediaIdsExist: MediaPortType["mediaIdsExist"] = (mediaIds: string[]) =>
    Effect.gen(function* () {
      if (mediaIds.length === 0) {
        return true;
      }

      // This is a N+1 Problem query. We dont optimize for it now, but if it becomes a Problem, this needs to be optimized.
      const results = yield* Effect.all(
        mediaIds.map((mediaId: string) =>
          Effect.either(mediaService.getMediaById(mediaId)),
        ),
      );

      return results.every(
        (result: { _tag: string }) => result._tag === "Right",
      );
    }).pipe(
      Effect.mapError(
        (error: { message: string }): MediaPortError =>
          new MediaPortError({
            message: `Failed to check if media IDs exist: ${error.message}`,
          }),
      ),
    );

  return {
    mediaIdsExist,
  } satisfies MediaPortType;
});

export const DomainMediaAdapter = Layer.effect(MediaPort, make);
