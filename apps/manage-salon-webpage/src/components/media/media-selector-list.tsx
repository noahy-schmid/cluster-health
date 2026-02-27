"use client";

import { PlusIcon } from "lucide-react";
import MediaSelector from "./media-selector";

interface MediaSelectorListProps {
  value: string[];
  onChange: (mediaIds: string[]) => void;
  websiteId: string;
  label: string;
}

export default function MediaSelectorList({
  value,
  onChange,
  websiteId,
  label,
}: MediaSelectorListProps) {
  const handleAdd = () => {
    onChange([...value, ""]);
  };

  const _handleRemove = (index: number) => {
    const newValue = value.filter((_, i) => i !== index);
    onChange(newValue);
  };

  const handleChange = (index: number, mediaId: string) => {
    const newValue = [...value];
    newValue[index] = mediaId;
    onChange(newValue);
  };

  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">{label}</label>
      <div className="flex flex-col gap-sm">
        {value.map((mediaId, index) => (
          <MediaSelector
            key={index}
            value={mediaId}
            onChange={(newMediaId) => handleChange(index, newMediaId)}
            websiteId={websiteId}
            label=""
          />
        ))}
        <button
          type="button"
          onClick={handleAdd}
          className="flex items-center gap-sm px-md py-sm border border-dashed border-border rounded-md text-fg-normal hover:border-primary-700 hover:text-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Foto hinzufuegen</span>
        </button>
      </div>
    </div>
  );
}
