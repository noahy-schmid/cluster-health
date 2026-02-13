"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { fetchSections } from "@/api/sections-actions";
import PageHeader from "@/components/PageHeader";
import TextWithImageForm from "./TextWithImageForm";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { AllSections } from "@repo/website-database";

export default function TextWithImageEditPage() {
  const router = useRouter();
  const { salonId, websiteId, sectionId } = useWebsiteRouteContext();
  const [section, setSection] = useState<
    Extract<AllSections, { type: "text-with-image" }> | undefined
  >(undefined);

  useEffect(() => {
    const loadSection = async () => {
      if (!websiteId || !sectionId) return;

      const result = await fetchSections(websiteId);

      if (!result.success || !result.data) {
        router.replace(`/salon/${salonId}`);
        return;
      }

      const found = result.data.find((item) => item.id === sectionId);

      if (!found || found.type !== "text-with-image") {
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
          title="Text mit Bild bearbeiten"
          subtitle="Lade Abschnitt..."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Text mit Bild bearbeiten"
        subtitle="Passen Sie die Einstellungen für diesen Abschnitt an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <TextWithImageForm key={section.id} section={section} />
      </div>
    </div>
  );
}
