"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useWebsiteStore } from "@/services/website-store";
import PageHeader from "@/components/PageHeader";
import HeroForm from "@/components/website/forms/HeroForm";
import { HeroSettings } from "@/lib/types/section-types";

export default function HeroEditPage() {
  const router = useRouter();
  const websiteStore = useWebsiteStore();
  const heroSettings = websiteStore.heroSettings;

  // Initialize website store
  useEffect(() => {
    const init = async () => {
      if (websiteStore.loading) {
        await websiteStore.initialize();
      }
    };

    init();
  }, [websiteStore]);

  // Show loading state while store is initializing
  if (websiteStore.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Loading...</p>
      </div>
    );
  }

  const handleSave = async (settings: HeroSettings) => {
    await websiteStore.updateHeroSettings(settings);
    router.replace("/salon/website");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Startseite bearbeiten"
        subtitle="Passen Sie das Aussehen des Start-Bereichs auf Ihrer Webseite an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <HeroForm
          settings={heroSettings}
          onCancel={() => router.replace("/salon/website")}
          onSave={handleSave}
        />
      </div>
    </div>
  );
}
