"use client";

import { use, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useSectionsStore } from "@/services/sections-store";
import { useWebsiteStore } from "@/services/website-store";
import PageHeader from "@/components/PageHeader";
import GalleryForm from "@/components/website/forms/GalleryForm";

interface PageProps {
  params: Promise<{ sectionId: string }>;
}

export default function GalleryEditPage({ params }: PageProps) {
  const { sectionId } = use(params);
  const router = useRouter();
  const websiteStore = useWebsiteStore();
  const sections = useSectionsStore((state) => state.sections);
  const isLoadingSections = useSectionsStore((state) => state.isLoading);
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
  if (websiteStore.loading || isLoadingSections) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Loading...</p>
      </div>
    );
  }

  // Show error if section not found
  if (!section || section.type !== "gallery") {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Section not found</p>
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
        <GalleryForm
          key={section.id}
          section={section}
          onCancel={() => router.push("/website")}
          onSave={() => router.push("/website")}
        />
      </div>
    </div>
  );
}
