"use client";

import { useState } from "react";
import { useSectionsStore } from "@/services/sections-store";
import FormInput from "./FormInput";
import ImageUrlList from "./ImageUrlList";
import FormActions from "./FormActions";
import { AllSections, GallerySettings } from "@repo/website-database";

interface GalleryFormProps {
  section: Extract<AllSections, { type: "gallery" }>;
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
  const [menuTitle, setMenuTitle] = useState<string>(section.menuTitle || "");

  const handleSave = async () => {
    await updateSection({
      ...section,
      settings,
      menuTitle: menuTitle.trim() === "" ? undefined : menuTitle,
    });
    onSave();
  };

  return (
    <div className="flex flex-col gap-lg">
      <FormInput
        label="Menü Titel (optional)"
        value={menuTitle}
        onChange={(value) => setMenuTitle(value)}
        placeholder="Abschnitt im Menü anzeigen"
        helperText="Wenn ein Titel angegeben wird, erscheint dieser Abschnitt im Navigationsmenü"
      />

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
