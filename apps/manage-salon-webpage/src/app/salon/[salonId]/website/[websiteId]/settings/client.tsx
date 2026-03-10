"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import WebsiteSettingsForm, { WebsiteSettings } from "../../settings.form";
import { updateWebsiteSettings } from "../../settings.actions";

interface WebsiteSettingsPageClientProps {
  salonId: string;
  websiteId: string;
  initialSettings: WebsiteSettings;
}

export default function WebsiteSettingsPageClient({
  salonId,
  websiteId,
  initialSettings,
}: WebsiteSettingsPageClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>();

  const handleSubmit = async (settings: WebsiteSettings) => {
    setIsSubmitting(true);
    setError(undefined);

    const result = await updateWebsiteSettings(
      websiteId,
      settings.slug,
      settings.title,
      settings.faviconUrl,
      settings.menuBarTitle,
      settings.menuLogoPosition,
    );

    if (result.success) {
      router.push(`/salon/${salonId}/website/${websiteId}`);
    } else {
      setError(result.error);
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    router.push(`/salon/${salonId}/website/${websiteId}`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Website-Einstellungen"
        subtitle="Bearbeiten Sie die grundlegenden Einstellungen Ihrer Website"
      />
      <div className="bg-bg-1 rounded-lg p-lg">
        <WebsiteSettingsForm
          initialValues={initialSettings}
          onSubmit={handleSubmit}
          onCancel={handleCancel}
          isSubmitting={isSubmitting}
          error={error}
          saveLabel="Einstellungen speichern"
        />
      </div>
    </div>
  );
}
