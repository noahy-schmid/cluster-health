"use client";

import { useState } from "react";
import { useSectionsStore } from "@/services/sections-store";
import FormInput from "../../../../components/website/forms/FormInput";
import FormTextarea from "../../../../components/website/forms/FormTextarea";
import FormActions from "../../../../components/website/forms/FormActions";
import { AllSections, TextWithImageSettings } from "@repo/website-database";

interface TextWithImageFormProps {
  section: Extract<AllSections, { type: "text-with-image" }>;
  onSave: () => void;
  onCancel: () => void;
}

export default function TextWithImageForm({
  section,
  onSave,
  onCancel,
}: TextWithImageFormProps) {
  const updateSection = useSectionsStore((state) => state.updateSection);
  const [settings, setSettings] = useState<TextWithImageSettings>(
    section.settings,
  );
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
        label="Bild URL"
        value={settings.imageUrl}
        onChange={(value) => setSettings({ ...settings, imageUrl: value })}
        placeholder="https://example.com/image.jpg"
        type="url"
        required
      />

      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => setSettings({ ...settings, title: value })}
        placeholder="Abschnittstitel eingeben"
        required
      />

      <FormTextarea
        label="Text"
        value={settings.text}
        onChange={(value) => setSettings({ ...settings, text: value })}
        placeholder="Abschnittstext eingeben"
        rows={6}
        required
      />

      <FormActions onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
