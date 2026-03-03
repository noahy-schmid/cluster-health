/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import SectionHeader from "./SectionHeader";
import { ReasonSettings } from "@repo/website-domain";
import { getMediaUrl } from "@/api/media-actions";

interface ReasonCardProps {
  settings: ReasonSettings;
  order: number;
  menuTitle: string | undefined;
}

export default function ReasonCard({
  settings,
  order,
  menuTitle,
}: ReasonCardProps) {
  const itemCount = settings.items.length;
  const hasImages = settings.items.some(
    (item) => item.imageId && item.imageId.trim() !== "",
  );

  const { data: imageUrls } = useQuery({
    queryKey: ["mediaUrls", settings.items.map((item) => item.imageId)],
    queryFn: async () => {
      const urls: (string | null)[] = [];
      for (const item of settings.items) {
        if (!item.imageId || item.imageId.trim() === "") {
          urls.push(null);
          continue;
        }
        const result = await getMediaUrl(item.imageId);
        urls.push(result.success ? result.data : null);
      }
      return urls;
    },
    enabled: hasImages,
  });

  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <SectionHeader
        order={order}
        title="Gründe Abschnitt"
        menuTitle={menuTitle}
      />

      <div className="space-y-sm">
        <h4 className="font-normal text-fg-normal text-lg">{settings.title}</h4>
        <h6 className="font-unfocus text-fg-normal text-base">
          {settings.subtitle}
        </h6>

        <div className="pt-sm">
          <p className="text-sm text-fg-muted mb-sm">
            {itemCount} {itemCount === 1 ? "Grund" : "Gründe"}
            {hasImages && " (mit Bildern)"}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm">
            {settings.items.slice(0, 4).map((item, index) => {
              const imageUrl = imageUrls?.[index] || item.imageId;
              return (
                <div
                  key={index}
                  className="p-sm rounded-md border border-border text-center"
                >
                  {item.imageId && item.imageId.trim() !== "" && (
                    <div className="w-32 h-32 rounded-full overflow-hidden mb-sm mx-auto">
                      {}
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <h5 className="font-medium text-fg-normal text-sm">
                    {item.title || `Grund ${index + 1}`}
                  </h5>
                  <p className="text-xs text-fg-muted line-clamp-2">
                    {item.description || "Keine Beschreibung"}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
