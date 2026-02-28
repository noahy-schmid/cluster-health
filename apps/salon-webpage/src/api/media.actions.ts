"use server";

import { MediaService, MediaLayer } from "@repo/salon-domain";
import { Effect } from "effect";

export async function getMediaUrl(
  mediaId: string,
): Promise<{ success: boolean; data: string | null }> {
  const effect = Effect.gen(function* () {
    const mediaService = yield* MediaService;
    return yield* mediaService.getMediaUrl(mediaId).pipe(
      Effect.map((url) => url as string),
      Effect.catchAll(() => Effect.succeed(null)),
    );
  }).pipe(Effect.provide(MediaLayer));

  const url = await Effect.runPromise(effect);
  return { success: true, data: url };
}
