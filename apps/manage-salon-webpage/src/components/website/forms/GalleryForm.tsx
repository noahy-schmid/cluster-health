"use client";

import { useState } from "react";
import { useSectionsStore } from "@/services/sections-store";
import { Section, GallerySettings } from "@/lib/types/section-types";
import FormInput from "./FormInput";
import ImageUrlList from "./ImageUrlList";
import FormActions from "./FormActions";

interface GalleryFormProps {
  section: Extract<Section, { type: "gallery" }>;
  onSave: () => void;
  onCancel: () => void;
}

export default function GalleryForm({
  section,
  onSave,
  onCancel,
}: GalleryFormProps) {
  const updateSection = useSectionsStore((state) => state.updateSection);
  const [settings, setSettings] = useState<GallerySettings>(section.settings);

  const handleSave = async () => {
    await updateSection({
      ...section,
      settings,
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-lg">
      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => setSettings({ ...settings, title: value })}
        placeholder="Gallerietitel eingeben"
        required
      />

      <FormInput
        label="Untertitel"
        value={settings.subtitle}
        onChange={(value) => setSettings({ ...settings, subtitle: value })}
        placeholder="Gallerieuntertitel eingeben"
        required
      />

      <ImageUrlList
        label="Galleriebilder"
        imageUrls={settings.imageUrls}
        onChange={(imageUrls) => setSettings({ ...settings, imageUrls })}
      />

      <FormActions onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
