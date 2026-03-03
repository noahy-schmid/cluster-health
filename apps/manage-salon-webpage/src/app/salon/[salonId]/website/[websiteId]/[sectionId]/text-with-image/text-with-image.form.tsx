"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSection } from "@/api/sections-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections, TextWithImageSettings } from "@repo/website-domain";
import FormActions from "@/components/website/forms/FormActions";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormInput from "@/components/website/forms/FormInput";
import MediaSelector from "@/components/media/media-selector";

interface TextWithImageFormProps {
  section: Extract<AllSections, { type: "text-with-image" }>;
}

export default function TextWithImageForm({ section }: TextWithImageFormProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [settings, setSettings] = useState<TextWithImageSettings>(
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
        helperText="Wenn ein Titel angegeben wird, erscheint dieser Abschnitt im Navigationsmenu"
      />

      <MediaSelector
        label="Bild"
        salonId={salonId!}
        value={settings.imageId}
        onChange={(value) => setSettings({ ...settings, imageId: value })}
      ></MediaSelector>

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

      <FormActions
        onCancel={() =>
          router.replace(`/salon/${salonId}/website/${websiteId}`)
        }
        onSave={handleSave}
      />
    </div>
  );
}
