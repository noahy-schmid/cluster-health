"use client";

import { useState } from "react";
import FormInput from "./FormInput";
import FormToggle from "./FormToggle";
import FormActions from "./FormActions";
import { HeroSettings } from "@repo/website-database";

interface HeroFormProps {
  settings: HeroSettings;
  onSave: (settings: HeroSettings) => void;
  onCancel: () => void;
  onFieldChange?: (settings: HeroSettings) => void;
}

export default function HeroForm({
  settings: initialSettings,
  onSave,
  onCancel,
  onFieldChange,
}: HeroFormProps) {
  const [settings, setSettings] = useState<HeroSettings>(initialSettings);

  const handleSave = async () => {
    onSave(settings);
  };

  return (
    <div className="flex flex-col gap-lg">
      <FormInput
        label="Hintergrundbild URL"
        value={settings.heroImage}
        onChange={(value) => setSettings({ ...settings, heroImage: value })}
        onBlur={() => {
          if (onFieldChange) onFieldChange(settings);
        }}
        placeholder="https://example.com/background.jpg"
        type="url"
        required
        helperText="Das Hintergrundbild wird über den gesamten Hero-Bereich angezeigt"
      />

      <FormInput
        label="Logo URL"
        value={settings.logo}
        onChange={(value) => setSettings({ ...settings, logo: value })}
        onBlur={() => {
          if (onFieldChange) onFieldChange(settings);
        }}
        placeholder="https://example.com/logo.png"
        type="url"
        required
        helperText="Das Logo wird im Hero-Bereich angezeigt"
      />

      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => setSettings({ ...settings, title: value })}
        onBlur={() => {
          if (onFieldChange) onFieldChange(settings);
        }}
        placeholder="Willkommen in unserem Salon"
        required
        helperText="Ein kurzer, einprägsamer Titel für Ihren Hero-Bereich"
      />

      <FormToggle
        label="Textfarbe"
        value={settings.textColor === "dark"}
        onChange={(isDark) => {
          const newSettings = {
            ...settings,
            textColor: isDark ? "dark" : "light",
          } as HeroSettings;
          setSettings(newSettings);
          if (onFieldChange) onFieldChange(newSettings);
        }}
        onLabel="Dunkel"
        offLabel="Hell"
        helperText="Wählen Sie die Textfarbe basierend auf dem Hintergrundbild für optimale Lesbarkeit"
      />

      <FormInput
        label="Untertitel"
        value={settings.subtitle}
        onChange={(value) => setSettings({ ...settings, subtitle: value })}
        onBlur={() => {
          if (onFieldChange) onFieldChange(settings);
        }}
        placeholder="Ihr Stil, unsere Leidenschaft"
        required
        helperText="Ein zusätzlicher Text, der den Titel ergänzt"
      />

      <FormActions onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
