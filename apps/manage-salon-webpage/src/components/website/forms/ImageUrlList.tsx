"use client";

import { PlusIcon, TrashIcon } from "lucide-react";

interface ImageUrlListProps {
  label: string;
  imageUrls: string[];
  onChange: (imageUrls: string[]) => void;
}

export default function ImageUrlList({
  label,
  imageUrls,
  onChange,
}: ImageUrlListProps) {
  const addImageUrl = () => {
    onChange([...imageUrls, ""]);
  };

  const removeImageUrl = (index: number) => {
    onChange(imageUrls.filter((_, i) => i !== index));
  };

  const updateImageUrl = (index: number, value: string) => {
    const newUrls = [...imageUrls];
    newUrls[index] = value;
    onChange(newUrls);
  };

  return (
    <div className="flex flex-col gap-sm">
      <label className="text-sm font-normal text-fg-strong">{label}</label>
      <div className="flex flex-col gap-sm">
        {imageUrls.map((url, index) => (
          <div key={index} className="flex gap-sm items-center">
            <input
              type="url"
              value={url}
              onChange={(e) => updateImageUrl(index, e.target.value)}
              placeholder="https://example.com/image.jpg"
              className="flex-1 px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
            />
            <button
              type="button"
              onClick={() => removeImageUrl(index)}
              className="p-sm text-fg-muted hover:bg-bg-0 hover:text-red-700 rounded-md transition-colors"
              aria-label="Remove image"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
          </div>
        ))}
        <button
          type="button"
          onClick={addImageUrl}
          className="flex items-center gap-sm px-md py-sm border border-dashed border-border rounded-md text-fg-normal hover:border-primary-700 hover:text-primary-700 transition-colors"
        >
          <PlusIcon className="w-5 h-5" />
          <span>Foto URL hinzufügen</span>
        </button>
      </div>
    </div>
  );
}
