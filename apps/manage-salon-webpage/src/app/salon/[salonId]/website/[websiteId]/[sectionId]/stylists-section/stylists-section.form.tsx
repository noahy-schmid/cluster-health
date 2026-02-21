"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSection } from "@/api/sections-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections, StylistsSettings } from "@repo/website-database";
import FormInput from "@/components/website/forms/FormInput";
import FormActions from "@/components/website/forms/FormActions";
import FormTextarea from "@/components/website/forms/FormTextarea";

interface StylistsFormProps {
  section: Extract<AllSections, { type: "stylists-section" }>;
}

export default function StylistsForm({ section }: StylistsFormProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [settings, setSettings] = useState<StylistsSettings>(section.settings);
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
        placeholder="z.B. Unser Team"
        required
      />

      <FormTextarea
        label="Untertitel"
        value={settings.subtitle}
        onChange={(value) => setSettings({ ...settings, subtitle: value })}
        placeholder="z.B. Lernen Sie unsere professionellen Stylisten kennen"
        required
      />

      <p className="text-sm text-fg-muted">
        Die Stylisten werden auf einer separaten Seite verwaltet. Sie können
        diesen Abschnitt verwenden, um einen Titel und Untertitel für den Team
        Abschnitt festzulegen. Die Stylisten selbst werden zentral im Salon
        verwaltet.
      </p>

      <FormActions
        onCancel={() =>
          router.replace(`/salon/${salonId}/website/${websiteId}`)
        }
        onSave={handleSave}
      />
    </div>
  );
}
