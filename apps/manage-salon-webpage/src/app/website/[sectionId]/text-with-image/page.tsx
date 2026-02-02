"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSectionById } from "@/lib/storage";
import { useSectionsStore } from "@/services/sections-store";
import { TextWithImageSettings } from "@/lib/types/section-types";
import FormInput from "@/components/webseite/forms/FormInput";
import FormTextarea from "@/components/webseite/forms/FormTextarea";
import FormActions from "@/components/webseite/forms/FormActions";
import PageHeader from "@/components/PageHeader";

interface PageProps {
  params: Promise<{ sectionId: string }>;
}

export default function TextWithImageEditPage({ params }: PageProps) {
  const { sectionId } = use(params);
  const router = useRouter();
  const updateSection = useSectionsStore((state) => state.updateSection);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<TextWithImageSettings>({
    imageUrl: "",
    title: "",
    text: "",
  });

  useEffect(() => {
    const loadSection = () => {
      const section = getSectionById(sectionId);
      if (section && section.type === "text-with-image") {
        setSettings(section.settings);
      }
      setLoading(false);
    };
    loadSection();
  }, [sectionId]);

  const handleSave = async () => {
    const section = getSectionById(sectionId);
    if (section && section.type === "text-with-image") {
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
        title="Text mit Bild bearbeiten"
        subtitle="Passen Sie die Einstellungen für diesen Abschnitt an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <div className="flex flex-col gap-lg">
          <FormInput
            label="Bild URL"
            value={settings.imageUrl}
            onChange={(value) => setSettings({ ...settings, imageUrl: value })}
            placeholder="https://example.com/image.jpg"
            type="url"
            required
          />

          <FormInput
            label="Titel"
            value={settings.title}
            onChange={(value) => setSettings({ ...settings, title: value })}
            placeholder="Abschnittstitel eingeben"
            required
          />

          <FormTextarea
            label="Text"
            value={settings.text}
            onChange={(value) => setSettings({ ...settings, text: value })}
            placeholder="Abschnittstext eingeben"
            rows={6}
            required
          />

          <FormActions onCancel={handleCancel} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
