/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import SectionHeader from "./SectionHeader";
import { GallerySettings } from "@repo/website-domain";
import { getMediaUrl } from "@/api/media-actions";

interface GalleryCardProps {
  settings: GallerySettings;
  order: number;
  menuTitle: string | undefined;
}

export default function GalleryCard({
  settings,
  order,
  menuTitle,
}: GalleryCardProps) {
  const imageCount = settings.imageIds.length;
  const previewImageIds = settings.imageIds.slice(0, 4);

  const { data: imageUrls } = useQuery({
    queryKey: ["mediaUrls", settings.imageIds],
    queryFn: async () => {
      const urls: (string | null)[] = [];
      for (const imageId of settings.imageIds) {
        if (!imageId || imageId.trim() === "") {
          urls.push(null);
          continue;
        }
        const result = await getMediaUrl(imageId);
        urls.push(result.success ? result.data : null);
      }
      return urls;
    },
    enabled: settings.imageIds.length > 0,
  });

  const previewImages = previewImageIds.map((id, index) => ({
    id,
    url: imageUrls?.[index] || id,
  }));

  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <SectionHeader
        order={order}
        title="Bilder Gallerie"
        menuTitle={menuTitle}
      />

      <div className="space-y-sm">
        <h4 className="font-normal text-fg-normal text-lg">{settings.title}</h4>
        <h6 className="font-unfocus text-fg-normal text-base">
          {settings.subtitle}
        </h6>

        {imageCount > 0 ? (
          <div>
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-sm mb-sm">
              {previewImages.map((image, index) => (
                <div
                  key={index}
                  className="aspect-square bg-gray-100 rounded-md overflow-hidden"
                >
                  {image.url && image.url.trim() !== "" ? (
                    <img
                      src={image.url}
                      alt={`Gallery image ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                      <ImageIcon className="w-6 h-6" />
                    </div>
                  )}
                </div>
              ))}
            </div>
            <p className="text-sm text-fg-muted">
              {imageCount} {imageCount === 1 ? "Bild" : "Bilder"}
              {imageCount > 4 && ` (zeige die ersten 4)`}
            </p>
          </div>
        ) : (
          <div className="py-lg flex flex-col items-center gap-sm text-fg-muted">
            <ImageIcon className="w-8 h-8" />
            <span className="text-sm">Keine Bilder</span>
          </div>
        )}
      </div>
    </div>
  );
}
