"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSection } from "@/api/sections-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import FormInput from "./FormInput";
import FormTextarea from "./FormTextarea";
import FormActions from "./FormActions";
import { AllSections, CenterTextSettings } from "@repo/website-database";

interface CenterTextFormProps {
  section: Extract<AllSections, { type: "center-text" }>;
}

export default function CenterTextForm({ section }: CenterTextFormProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [settings, setSettings] = useState<CenterTextSettings>(
    section.settings,
  );
  const [menuTitle, setMenuTitle] = useState<string>(section.menuTitle || "");

  const handleSave = async () => {
    await updateSection(websiteId ?? "", {
      ...section,
      settings,
      menuTitle: menuTitle.trim() === "" ? undefined : menuTitle,
    });
    router.replace(`/salon/${salonId}/website/${websiteId}`);
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
        placeholder="Titel eingeben"
        required
      />

      <FormTextarea
        label="Inhalt"
        value={settings.content}
        onChange={(value) => setSettings({ ...settings, content: value })}
        placeholder="Inhalt eingeben"
        rows={6}
        required
      />

      <FormActions
        onCancel={() =>
          router.replace(`/salon/${salonId}/website/${websiteId}`)
        }
        onSave={handleSave}
      />
    </div>
  );
}
