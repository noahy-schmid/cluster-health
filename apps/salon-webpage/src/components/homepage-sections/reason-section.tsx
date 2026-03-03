/* eslint-disable @next/next/no-img-element */
"use client";

import { useQuery } from "@tanstack/react-query";
import { ReasonSettings } from "@repo/website-domain";
import { getMediaUrl } from "@/api/media.actions";

interface ReasonSectionProps {
  settings: ReasonSettings;
}

export default function ReasonSection({ settings }: ReasonSectionProps) {
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

  // Calculate grid columns based on item count
  const gridColsClass =
    settings.items.length === 2
      ? "md:grid-cols-2"
      : settings.items.length === 3
        ? "md:grid-cols-3"
        : "md:grid-cols-2 lg:grid-cols-4";

  return (
    <section className="px-4 py-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="text-4xl font-semibold text-salon-fg-strong">
          {settings.title}
        </h2>
        <p className="text-base font-light text-salon-fg-base">
          {settings.subtitle}
        </p>
      </div>

      {/* Grid of reason items */}
      <div className={`grid grid-cols-1 ${gridColsClass} gap-12`}>
        {settings.items.map((item, index) => {
          const imageUrl = imageUrls?.[index];
          return (
            <div
              key={index}
              className="text-center flex flex-col items-center hover:bg-salon-bg-1 hover:shadow-lg rounded-lg p-6 transition-colors"
            >
              {hasImages &&
                item.imageId &&
                item.imageId.trim() !== "" &&
                imageUrl && (
                  <div className="mb-4 w-full">
                    <div className="aspect-square rounded-full overflow-hidden w-40 h-40 mx-auto">
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                )}

              <h3 className="text-2xl font-semibold text-salon-fg-strong">
                {item.title}
              </h3>
              <p className="text-base font-light text-salon-fg-base">
                {item.description}
              </p>
            </div>
          );
        })}
      </div>
    </section>
  );
}
