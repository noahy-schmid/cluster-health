"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSectionById } from "@/lib/storage";
import { useSectionsStore } from "@/services/sections-store";
import { GallerySettings } from "@/lib/types/section-types";
import FormInput from "@/components/website/forms/FormInput";
import ImageUrlList from "@/components/website/forms/ImageUrlList";
import FormActions from "@/components/website/forms/FormActions";
import PageHeader from "@/components/PageHeader";

interface PageProps {
  params: Promise<{ sectionId: string }>;
}

export default function GalleryEditPage({ params }: PageProps) {
  const { sectionId } = use(params);
  const router = useRouter();
  const updateSection = useSectionsStore((state) => state.updateSection);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<GallerySettings>({
    title: "",
    subtitle: "",
    imageUrls: [],
  });

  useEffect(() => {
    const loadSection = () => {
      const section = getSectionById(sectionId);
      if (section && section.type === "gallery") {
        setSettings(section.settings);
      }
      setLoading(false);
    };
    loadSection();
  }, [sectionId]);

  const handleSave = async () => {
    const section = getSectionById(sectionId);
    if (section && section.type === "gallery") {
      await updateSection({
        ...section,
        settings,
      });
      router.push("/website");
    }
  };

  const handleCancel = () => {
    router.push("/website");
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Loading...</p>
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
        <div className="flex flex-col gap-lg">
          <FormInput
            label="Titel"
            value={settings.title}
            onChange={(value) => setSettings({ ...settings, title: value })}
            placeholder="Gallerietitel eingeben"
            required
          />

          <FormInput
            label="Untertitel"
            value={settings.subtitle}
            onChange={(value) => setSettings({ ...settings, subtitle: value })}
            placeholder="Gallerieuntertitel eingeben"
            required
          />

          <ImageUrlList
            label="Galleriebilder"
            imageUrls={settings.imageUrls}
            onChange={(imageUrls) => setSettings({ ...settings, imageUrls })}
          />

          <FormActions onCancel={handleCancel} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
