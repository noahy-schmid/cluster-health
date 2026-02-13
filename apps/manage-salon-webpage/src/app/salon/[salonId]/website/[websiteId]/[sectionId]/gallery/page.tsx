"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSections } from "@/api/sections-actions";
import PageHeader from "@/components/PageHeader";
import GalleryForm from "@/components/website/forms/GalleryForm";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections } from "@repo/website-database";

export default function GalleryEditPage() {
  const router = useRouter();
  const { salonId, websiteId, sectionId } = useWebsiteRouteContext();
  const [section, setSection] = useState<
    Extract<AllSections, { type: "gallery" }> | undefined
  >(undefined);

  useEffect(() => {
    const loadSection = async () => {
      if (!websiteId || !sectionId) return;

      const result = await fetchSections(websiteId);

      if (!result.success) {
        router.replace(`/salon/${salonId}`);
        return;
      }

      const found = result.data.find((item) => item.id === sectionId);

      if (!found || found.type !== "gallery") {
        router.replace(`/salon/${salonId}/website/${websiteId}`);
        return;
      }

      setSection(found);
    };

    loadSection();
  }, [router, salonId, websiteId, sectionId]);

  if (!section) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Gallerie bearbeiten" subtitle="Lade Abschnitt..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Gallerie bearbeiten"
        subtitle="Passen Sie den Titel, Untertitel und die Bilder für diese Gallerie an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <GalleryForm key={section.id} section={section} />
      </div>
    </div>
  );
}
