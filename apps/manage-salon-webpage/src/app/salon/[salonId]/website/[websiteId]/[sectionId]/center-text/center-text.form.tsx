"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSection } from "@/api/sections-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections, CenterTextSettings } from "@repo/website-domain";
import FormInput from "@/components/website/forms/FormInput";
import FormActions from "@/components/website/forms/FormActions";
import FormTextarea from "@/components/website/forms/FormTextarea";

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
        label="Menu Titel (optional)"
        value={menuTitle}
        onChange={(value) => setMenuTitle(value)}
        placeholder="Abschnitt im Menu anzeigen"
        testId="center-text-menu-title-input"
        helperText="Wenn ein Titel angegeben wird, erscheint dieser Abschnitt im Navigationsmenu"
      />

      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => setSettings({ ...settings, title: value })}
        placeholder="Titel eingeben"
        required
        testId="center-text-title-input"
      />

      <FormTextarea
        label="Inhalt"
        value={settings.content}
        onChange={(value) => setSettings({ ...settings, content: value })}
        placeholder="Inhalt eingeben"
        rows={6}
        required
        testId="center-text-content-input"
      />

      <FormActions
        onCancel={() =>
          router.replace(`/salon/${salonId}/website/${websiteId}`)
        }
        onSave={handleSave}
        saveTestId="center-text-save-button"
      />
    </div>
  );
}
