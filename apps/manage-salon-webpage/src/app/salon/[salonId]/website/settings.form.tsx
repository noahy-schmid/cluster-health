"use client";

import { useState } from "react";
import FormInput from "../../../../components/website/forms/FormInput";
import FormActions from "../../../../components/website/forms/FormActions";
import MediaSelector from "@/components/media/media-selector";

export interface WebsiteSettings {
  slug: string;
  title: string;
  faviconMediaId: string;
}

interface WebsiteSettingsFormProps {
  salonId: string;
  initialValues: WebsiteSettings;
  onSubmit: (settings: WebsiteSettings) => void;
  onCancel: () => void;
  isSubmitting: boolean;
  error?: string;
  saveLabel?: string;
}

export default function WebsiteSettingsForm({
  salonId,
  initialValues,
  onSubmit,
  onCancel,
  isSubmitting,
  error,
  saveLabel = "Webseite erstellen",
}: WebsiteSettingsFormProps) {
  const [slug, setSlug] = useState(initialValues.slug);
  const [title, setTitle] = useState(initialValues.title);
  const [faviconMediaId, setFaviconMediaId] = useState(
    initialValues.faviconMediaId,
  );

  const handleSave = () => {
    if (!slug.trim() || !title.trim()) {
      return;
    }
    onSubmit({ slug, title, faviconMediaId });
  };

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-lg">
      <FormInput
        label="URL-Slug"
        value={slug}
        onChange={setSlug}
        placeholder="mein-salon"
        required
        testId="website-slug-input"
        helperText="Der URL-Slug wird verwendet, um Ihre Website zu identifizieren (z.B. slug.dein.salon)"
      />

      <FormInput
        label="Seitentitel"
        value={title}
        onChange={setTitle}
        placeholder="Mein Friseursalon - Willkommen"
        required
        testId="website-title-input"
        helperText="Der Titel, der im Browser-Tab und in Suchergebnissen angezeigt wird"
      />

      <MediaSelector
        salonId={salonId}
        label="Favicon"
        value={faviconMediaId || undefined}
        onChange={setFaviconMediaId}
        helperText="Das Favicon wird im Browser-Tab angezeigt (optional)"
      />

      {error && (
        <p className="text-sm text-red-600 bg-red-50 px-md py-sm rounded-md">
          {error}
        </p>
      )}

      <FormActions
        onSave={handleSave}
        onCancel={onCancel}
        saveLabel={saveLabel}
        isSaving={isSubmitting}
        saveTestId="website-save-button"
      />
    </form>
  );
}
