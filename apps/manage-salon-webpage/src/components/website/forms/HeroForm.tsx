"use client";

import { useState } from "react";
import { HeroSettings } from "@/lib/types/section-types";
import FormInput from "./FormInput";
import FormActions from "./FormActions";

interface HeroFormProps {
  settings: HeroSettings;
  onSave: (settings: HeroSettings) => void;
  onCancel: () => void;
}

export default function HeroForm({
  settings: initialSettings,
  onSave,
  onCancel,
}: HeroFormProps) {
  const [settings, setSettings] = useState<HeroSettings>(initialSettings);

  const handleSave = async () => {
    onSave(settings);
  };

  return (
    <div className="flex flex-col gap-lg">
      <FormInput
        label="Hintergrundbild URL"
        value={settings.backgroundImageUrl}
        onChange={(value) =>
          setSettings({ ...settings, backgroundImageUrl: value })
        }
        placeholder="https://example.com/background.jpg"
        type="url"
        required
        helperText="Das Hintergrundbild wird über den gesamten Hero-Bereich angezeigt"
      />

      <FormInput
        label="Logo URL"
        value={settings.logoImageUrl}
        onChange={(value) => setSettings({ ...settings, logoImageUrl: value })}
        placeholder="https://example.com/logo.png"
        type="url"
        required
        helperText="Das Logo wird im Hero-Bereich angezeigt"
      />

      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => setSettings({ ...settings, title: value })}
        placeholder="Willkommen in unserem Salon"
        required
        helperText="Ein kurzer, einprägsamer Titel für Ihren Hero-Bereich"
      />

      <FormInput
        label="Untertitel"
        value={settings.subtitle}
        onChange={(value) => setSettings({ ...settings, subtitle: value })}
        placeholder="Ihr Stil, unsere Leidenschaft"
        required
        helperText="Ein zusätzlicher Text, der den Titel ergänzt"
      />

      <FormActions onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
