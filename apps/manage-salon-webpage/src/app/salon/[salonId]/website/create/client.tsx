"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import WebsiteSettingsForm, {
  WebsiteSettings,
} from "@/app/salon/[salonId]/website/settings.form";
import { createWebsite } from "../settings.actions";

interface WebsiteCreateClientProps {
  salonId: string;
  initialValues: WebsiteSettings;
}

export default function WebsiteCreateClient({
  salonId,
  initialValues,
}: WebsiteCreateClientProps) {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSubmit = async (settings: WebsiteSettings) => {
    setIsSubmitting(true);
    setError(undefined);

    const result = await createWebsite(
      settings.slug,
      settings.title,
      settings.faviconUrl,
    );

    if (result.success) {
      router.replace(`/salon/${salonId}/website/${result.websiteId}`);
      return;
    }

    setError(result.error);
    setIsSubmitting(false);
  };

  const handleCancel = () => {
    router.replace(`/salon/${salonId}`);
  };

  return (
    <WebsiteSettingsForm
      initialValues={initialValues}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      isSubmitting={isSubmitting}
      error={error}
    />
  );
}
