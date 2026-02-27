"use client";

import { useState } from "react";
import { HeroSettings } from "@repo/website-database";
import { useDebounce } from "@/hooks/useDebounce";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import FormInput from "@/components/website/forms/FormInput";
import FormToggle from "@/components/website/forms/FormToggle";
import FormActions from "@/components/website/forms/FormActions";
import MediaSelector from "@/components/media/media-selector";

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
  const { websiteId } = useWebsiteRouteContext();
  const [settings, setSettings] = useState<HeroSettings>(initialSettings);

  const debouncedFieldChange = useDebounce((newSettings: HeroSettings) => {
    if (onFieldChange) {
      onFieldChange(newSettings);
    }
  }, 300);

  const handleSave = async () => {
    onSave(settings);
  };

  const handleHeroImageChange = (mediaId: string) => {
    const newSettings = { ...settings, heroImage: mediaId };
    setSettings(newSettings);
    debouncedFieldChange(newSettings);
  };

  const handleLogoChange = (mediaId: string) => {
    const newSettings = { ...settings, logo: mediaId };
    setSettings(newSettings);
    debouncedFieldChange(newSettings);
  };

  return (
    <div className="flex flex-col gap-lg">
      <MediaSelector
        websiteId={websiteId ?? ""}
        label="Hintergrundbild"
        value={settings.heroImage ?? ""}
        onChange={handleHeroImageChange}
        required
        helperText="Das Hintergrundbild wird über den gesamten Hero-Bereich angezeigt"
      />

      <MediaSelector
        websiteId={websiteId ?? ""}
        label="Logo"
        value={settings.logo ?? ""}
        onChange={handleLogoChange}
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
