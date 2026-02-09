"use client";

import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import HeroForm from "@/components/website/forms/HeroForm";
import { HeroSettings } from "@/lib/types/section-types";
import { updateHeroSettings } from "@/api/website-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";

interface HeroEditClientProps {
  initialSettings: HeroSettings;
}

export default function HeroEditClient({
  initialSettings,
}: HeroEditClientProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();

  const handleSave = async (settings: HeroSettings) => {
    await updateHeroSettings(websiteId ?? "", settings);
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
          onCancel={() =>
            router.replace(`/salon/${salonId}/website/${websiteId}`)
          }
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
