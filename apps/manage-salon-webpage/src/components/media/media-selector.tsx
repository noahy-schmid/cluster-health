/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { PencilIcon, ImageIcon } from "lucide-react";
import MediaModal from "./media-modal";
import { getMediaUrl } from "@/api/media-actions";

interface MediaSelectorProps {
  value?: string;

  onChange: (mediaId: string) => void;
  salonId: string;
  label: string;
  required?: boolean;
  helperText?: string;
}

export default function MediaSelector({
  value,
  onChange,
  salonId,
  label,
  required,
  helperText,
}: MediaSelectorProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data: mediaUrl } = useQuery({
    queryKey: ["mediaUrl", value],
    queryFn: async () => {
      if (!value) return null;
      const result = await getMediaUrl(value);
      if (result.success) {
        return result.data;
      }
      return null;
    },
    enabled: !!value,
  });

  const handleSelect = (mediaId: string) => {
    onChange(mediaId);
    setIsModalOpen(false);
  };

  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </label>
      <div
        onClick={() => setIsModalOpen(true)}
        className="flex items-center gap-md p-md border border-border rounded-md bg-bg-0 cursor-pointer hover:border-primary-500 transition-colors"
      >
        <div className="w-24 h-20 bg-bg-2 rounded flex items-center justify-center overflow-hidden flex-shrink-0">
          {mediaUrl ? (
            <img
              src={mediaUrl}
              alt="Selected media"
              className="w-full h-full object-cover"
            />
          ) : (
            <ImageIcon className="w-8 h-8 text-fg-muted" />
          )}
        </div>
        <div className="flex-1 flex items-center justify-between min-w-0">
          <span className="text-sm text-fg-normal truncate">
            {value ? "Bild ausgewählt" : "Kein Bild ausgewählt"}
          </span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(true);
            }}
            className="p-xs text-fg-muted hover:text-primary-700 rounded transition-colors"
            aria-label="Edit media"
          >
            <PencilIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
      {helperText && <p className="text-sm text-fg-muted">{helperText}</p>}
      <MediaModal
        salonId={salonId}
        onSelect={handleSelect}
        onClose={() => setIsModalOpen(false)}
        isOpen={isModalOpen}
      />
    </div>
  );
}
