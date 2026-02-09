"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSections } from "@/api/sections-actions";
import PageHeader from "@/components/PageHeader";
import CenterTextForm from "@/components/website/forms/CenterTextForm";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections } from "@repo/website-database";

export default function CenterTextEditPage() {
  const router = useRouter();
  const { salonId, websiteId, sectionId } = useWebsiteRouteContext();
  const [section, setSection] = useState<
    Extract<AllSections, { type: "center-text" }> | undefined
  >(undefined);

  useEffect(() => {
    const loadSection = async () => {
      if (!websiteId || !sectionId) return;

      const result = await fetchSections(websiteId);

      if (!result.success || !result.sections) {
        router.replace(`/salon/${salonId}`);
        return;
      }

      const found = result.sections.find((item) => item.id === sectionId);

      if (!found || found.type !== "center-text") {
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
        <PageHeader
          title="Text Abschnitt bearbeiten"
          subtitle="Lade Abschnitt..."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Text Abschnitt bearbeiten"
        subtitle="Passen Sie den Titel und Inhalt für diesen Abschnitt an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <CenterTextForm key={section.id} section={section} />
      </div>
    </div>
  );
}
