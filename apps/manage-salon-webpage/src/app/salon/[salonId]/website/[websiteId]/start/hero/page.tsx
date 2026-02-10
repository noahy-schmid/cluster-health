"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getHeroSettings } from "@/api/website-actions";
import HeroEditClient from "@/components/website/HeroEditClient";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { HeroSettings } from "@/lib/types/section-types";

export default function HeroEditPage() {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [heroSettings, setHeroSettings] = useState<HeroSettings | undefined>(
    undefined,
  );

  useEffect(() => {
    const loadSettings = async () => {
      if (!websiteId) return;

      const result = await getHeroSettings(websiteId);

      if (!result.success) {
        router.replace(`/salon/${salonId}`);
        return;
      }

      setHeroSettings({
        backgroundImageUrl: result.settings.heroImage,
        logoImageUrl: result.settings.logo,
        title: result.settings.title,
        subtitle: result.settings.subtitle,
      });
    };

    loadSettings();
  }, [router, salonId, websiteId]);

  if (!heroSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <HeroEditClient
          initialSettings={{
            backgroundImageUrl: "",
            logoImageUrl: "",
            title: "",
            subtitle: "",
          }}
        />
      </div>
    );
  }

  return <HeroEditClient initialSettings={heroSettings} />;
}
