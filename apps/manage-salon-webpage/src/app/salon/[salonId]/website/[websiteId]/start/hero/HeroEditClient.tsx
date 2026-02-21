"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { HeroSettings } from "@repo/website-database";
import { updateHeroSettings } from "@/api/website-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import HeroCard from "@/components/website/section-cards/HeroCard";
import { useState } from "react";
import HeroForm from "./hero.form";

interface HeroEditClientProps {
  initialSettings: HeroSettings;
}

export default function HeroEditClient({
  initialSettings,
}: HeroEditClientProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [previewSettings, setPreviewSettings] =
    useState<HeroSettings>(initialSettings);

  const handleSave = async (settings: HeroSettings) => {
    await updateHeroSettings(websiteId ?? "", {
      heroImage: settings.heroImage,
      logo: settings.logo,
      title: settings.title,
      subtitle: settings.subtitle,
      textColor: settings.textColor,
    });
    router.replace(`/salon/${salonId}/website/${websiteId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Startseite bearbeiten"
        subtitle="Passen Sie das Aussehen des Start-Bereichs auf Ihrer Webseite an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <HeroForm
          settings={initialSettings}
          onFieldChange={(s) => setPreviewSettings(s)}
          onCancel={() =>
            router.replace(`/salon/${salonId}/website/${websiteId}`)
          }
          onSave={handleSave}
        />
      </div>

      <div className="mt-lg max-w-4xl mx-auto">
        <HeroCard settings={previewSettings} />
      </div>
    </div>
  );
}
