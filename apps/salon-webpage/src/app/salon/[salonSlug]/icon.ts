import { MediaLayer, MediaService } from "@repo/salon-domain";
import { WebsiteLayer, WebsiteService } from "@repo/website-domain";
import { Effect, Layer, Option } from "effect";
import { NextResponse } from "next/server";

async function getFaviconData(salonSlug: string): Promise<{
  url: string | null;
  contentType?: string;
}> {
  return Effect.runPromise(
    Effect.gen(function* () {
      const websiteService = yield* WebsiteService;
      const mediaService = yield* MediaService;

      const settings = yield* websiteService.getWebsiteSettingsBySlug(salonSlug);
      const faviconMediaId = Option.getOrUndefined(settings.faviconMediaId);

      if (!faviconMediaId) {
        return { url: null };
      }

      const [url, media] = yield* Effect.all([
        mediaService.getMediaUrl(faviconMediaId),
        mediaService.getMediaById(faviconMediaId),
      ]);

      return {
        url,
        contentType: media.mimeType,
      };
    }).pipe(
      Effect.provide(Layer.merge(WebsiteLayer, MediaLayer)),
      Effect.catchAll(() => Effect.succeed({ url: null })),
    ),
  );
}

export async function generateImageMetadata({
  params,
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;
  const favicon = await getFaviconData(salonSlug);

  if (!favicon.url) {
    return [];
  }

  return [
    {
      id: "favicon",
      contentType: favicon.contentType,
    },
  ];
}

export default async function Icon({
  params,
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;
  const favicon = await getFaviconData(salonSlug);

  if (!favicon.url) {
    return new NextResponse(null, { status: 204 });
  }

  return NextResponse.redirect(favicon.url);
}
