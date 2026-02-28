"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSection } from "@/api/sections-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections, GallerySettings } from "@repo/website-database";
import FormInput from "@/components/website/forms/FormInput";
import MediaSelectorList from "@/components/media/media-selector-list";
import FormActions from "@/components/website/forms/FormActions";

interface GalleryFormProps {
  section: Extract<AllSections, { type: "gallery" }>;
}

export default function GalleryForm({ section }: GalleryFormProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [settings, setSettings] = useState<GallerySettings>(section.settings);
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

      <MediaSelectorList
        label="Galleriebilder"
        value={settings.imageIds}
        onChange={(imageIds) => setSettings({ ...settings, imageIds })}
        salonId={salonId!}
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
