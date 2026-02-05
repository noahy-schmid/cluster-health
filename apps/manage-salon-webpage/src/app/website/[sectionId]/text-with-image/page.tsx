"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSectionsStore } from "@/services/sections-store";
import { useWebsiteStore } from "@/services/website-store";
import PageHeader from "@/components/PageHeader";
import TextWithImageForm from "@/app/website/[sectionId]/text-with-image/TextWithImageForm";

interface PageProps {
  params: Promise<{ sectionId: string }>;
}

export default function TextWithImageEditPage({ params }: PageProps) {
  const { sectionId } = use(params);
  const router = useRouter();
  const websiteStore = useWebsiteStore();
  const sections = useSectionsStore((state) => state.sections);
  const sectionsStatus = useSectionsStore((state) => state.status);
  const initializeSections = useSectionsStore((state) => state.initialize);

  // Find the section from store
  const section = useMemo(
    () => sections.find((s) => s.id === sectionId),
    [sections, sectionId],
  );

  // Initialize stores
  useEffect(() => {
    const init = async () => {
      // Wait for website store to initialize
      if (websiteStore.loading) {
        await websiteStore.initialize();
      }

      // Then initialize sections store
      await initializeSections();
    };

    init();
  }, [websiteStore, initializeSections]);

  // Show loading state while stores are initializing
  if (websiteStore.loading || sectionsStatus !== "initialized") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Loading...</p>
      </div>
    );
  }

  // Show error if section not found
  if (!section || section.type !== "text-with-image") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Section not found</p>
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
        <TextWithImageForm
          key={section.id}
          section={section}
          onCancel={() => router.push("/website")}
          onSave={() => router.push("/website")}
        />
      </div>
    </div>
  );
}
