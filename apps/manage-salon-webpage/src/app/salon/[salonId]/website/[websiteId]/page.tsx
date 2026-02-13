"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSections } from "@/api/sections-actions";
import { getHeroSettings } from "@/api/website-actions";
import WebsiteEditorClient from "@/components/website/WebsiteEditorClient";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections, HeroSettings } from "@repo/website-database";
import PageHeader from "@/components/PageHeader";

export default function WebsiteEditorPage() {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [sections, setSections] = useState<AllSections[] | undefined>(
    undefined,
  );
  const [heroSettings, setHeroSettings] = useState<HeroSettings | undefined>(
    undefined,
  );

  useEffect(() => {
    const loadData = async () => {
      if (!websiteId) return;

      const [sectionsResult, heroResult] = await Promise.all([
        fetchSections(websiteId),
        getHeroSettings(websiteId),
      ]);

      if (!sectionsResult.success || !heroResult.success) {
        router.replace(`/salon/${salonId}`);
        return;
      }

      setSections(sectionsResult.data ?? []);
      setHeroSettings(heroResult.settings);
    };

    loadData();
  }, [router, salonId, websiteId]);

  if (!sections || !heroSettings) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Webseite bearbeiten" subtitle="Lade Abschnitte..." />
      </div>
    );
  }

  return (
    <WebsiteEditorClient
      initialSections={sections}
      heroSettings={heroSettings}
    />
  );
}
