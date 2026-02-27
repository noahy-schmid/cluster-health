"use client";

import { useState, useEffect } from "react";
import { Trash2Icon, CheckIcon } from "lucide-react";
import { MediaFile, getMediaUrl } from "@/api/media-actions";

interface MediaGridProps {
  media: MediaFile[];
  onSelect: (mediaId: string) => void;
  onDelete: (mediaId: string) => void;
  selectedId?: string;
}

export default function MediaGrid({
  media,
  onSelect,
  onDelete,
  selectedId,
}: MediaGridProps) {
  const [imageUrls, setImageUrls] = useState<Record<string, string>>({});

  useEffect(() => {
    media.forEach((item) => {
      if (!imageUrls[item.id]) {
        getMediaUrl(item.id).then((result) => {
          if (result.success) {
            setImageUrls((prev) => ({ ...prev, [item.id]: result.data }));
          }
        });
      }
    });
  }, [media]);

  if (media.length === 0) {
    return (
      <div className="flex items-center justify-center py-[var(--spacing-xl)] text-[var(--color-text-muted)] rounded-[var(--border-radius-lg)] border border-dashed border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
        Keine Medien vorhanden
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-[var(--spacing-md)]">
      {media.map((item) => {
        const url =
          imageUrls[item.id] || "https://placehold.co/400x300?text=Loading";
        const isSelected = selectedId === item.id;

        return (
          <div
            key={item.id}
            className={`group relative rounded-[var(--border-radius-md)] border transition-all duration-[var(--transition-fast)] cursor-pointer bg-white ${
              isSelected
                ? "border-[var(--color-primary)] ring-2 ring-[var(--color-primary)] ring-opacity-30"
                : "border-[var(--color-border)] hover:border-[var(--color-primary)] hover:shadow-md"
            }`}
            onClick={() => onSelect(item.id)}
          >
            <div className="aspect-[4/3] relative overflow-hidden rounded-t-[var(--border-radius-md)]">
              <img
                src={url}
                alt={item.fileName}
                className="w-full h-full object-cover transition-transform duration-[var(--transition-fast)] group-hover:scale-105"
              />
              {isSelected && (
                <div className="absolute top-[var(--spacing-xs)] right-[var(--spacing-xs)] bg-[var(--color-primary)] rounded-full p-[var(--spacing-xs)]">
                  <CheckIcon className="w-4 h-4 text-white" />
                </div>
              )}
            </div>
            <div className="p-[var(--spacing-sm)] flex items-center justify-between gap-[var(--spacing-xs)] border-t border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
              <span className="text-[length:var(--font-size-sm)] text-[var(--color-text-primary)] truncate flex-1 min-w-0">
                {item.fileName}
              </span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(item.id);
                }}
                className="flex-shrink-0 p-[var(--spacing-xs)] text-[var(--color-text-muted)] hover:text-red-600 rounded-[var(--border-radius-sm)] hover:bg-red-50 transition-colors"
                aria-label="Delete media"
              >
                <Trash2Icon className="w-4 h-4" />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
