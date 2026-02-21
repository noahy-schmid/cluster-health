"use client";

import { useState } from "react";
import { HeroSettings } from "@repo/website-database";
import { useDebounce } from "@/hooks/useDebounce";
import FormInput from "@/components/website/forms/FormInput";
import FormToggle from "@/components/website/forms/FormToggle";
import FormActions from "@/components/website/forms/FormActions";

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

  // Debounce the onFieldChange callback to avoid race conditions
  const debouncedFieldChange = useDebounce((newSettings: HeroSettings) => {
    if (onFieldChange) {
      onFieldChange(newSettings);
    }
  }, 300);

  const handleSave = async () => {
    onSave(settings);
  };

  return (
    <div className="flex flex-col gap-lg">
      <FormInput
        label="Hintergrundbild URL"
        value={settings.heroImage}
        onChange={(value) => {
          const newSettings = { ...settings, heroImage: value };
          setSettings(newSettings);
          debouncedFieldChange(newSettings);
        }}
        placeholder="https://example.com/background.jpg"
        type="url"
        required
        helperText="Das Hintergrundbild wird über den gesamten Hero-Bereich angezeigt"
      />

      <FormInput
        label="Logo URL"
        value={settings.logo}
        onChange={(value) => {
          const newSettings = { ...settings, logo: value };
          setSettings(newSettings);
          debouncedFieldChange(newSettings);
        }}
        placeholder="https://example.com/logo.png"
        type="url"
        required
        helperText="Das Logo wird im Hero-Bereich angezeigt"
      />

      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => {
          const newSettings = { ...settings, title: value };
          setSettings(newSettings);
          debouncedFieldChange(newSettings);
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
        onChange={(value) => {
          const newSettings = { ...settings, subtitle: value };
          setSettings(newSettings);
          debouncedFieldChange(newSettings);
        }}
        placeholder="Ihr Stil, unsere Leidenschaft"
        required
        helperText="Ein zusätzlicher Text, der den Titel ergänzt"
      />

      <FormActions onCancel={onCancel} onSave={handleSave} />
    </div>
  );
}
