"use client";

import { useState } from "react";
import FormToggle from "@/components/website/forms/FormToggle";
import FormInput from "../../../../components/website/forms/FormInput";
import FormActions from "../../../../components/website/forms/FormActions";
import MediaSelector from "@/components/media/media-selector";

export type MenuLogoPosition = "left" | "center";

export interface WebsiteSettings {
  slug: string;
  title: string;
  faviconMediaId: string;
  menuBarTitle: string;
  menuLogoPosition: MenuLogoPosition;
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
  const [menuBarTitle, setMenuBarTitle] = useState(initialValues.menuBarTitle);
  const [menuLogoPosition, setMenuLogoPosition] = useState<MenuLogoPosition>(
    initialValues.menuLogoPosition,
  );

  const handleSave = () => {
    if (!slug.trim() || !title.trim()) {
      return;
    }
    onSubmit({
      slug,
      title,
      faviconMediaId,
      menuBarTitle,
      menuLogoPosition,
    });
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

      <div className="rounded-lg border border-border bg-bg-0 p-md flex flex-col gap-md">
        <div className="flex flex-col gap-xs">
          <h3 className="text-base font-focus text-fg-strong">
            Sticky-Menü im Salon
          </h3>
          <p className="text-sm text-fg-muted">
            Steuern Sie, wie Logo und Titel in der fixierten Menüleiste nach dem
            Scrollen dargestellt werden.
          </p>
        </div>

        <FormToggle
          label="Logo in der Menüleiste zentrieren"
          value={menuLogoPosition === "center"}
          onChange={(isCentered) =>
            setMenuLogoPosition(isCentered ? "center" : "left")
          }
          offLabel="Links"
          onLabel="Zentriert"
          helperText="Wenn das Logo zentriert ist, wird der Menütitel ausgeblendet."
        />

        <FormInput
          label="Menütitel neben dem Logo"
          value={menuBarTitle}
          onChange={setMenuBarTitle}
          placeholder="Salonname"
          disabled={menuLogoPosition === "center"}
          helperText={
            menuLogoPosition === "center"
              ? "Der Menütitel ist nur sichtbar, wenn das Logo links ausgerichtet ist."
              : "Optionaler Titel rechts neben dem Logo in der fixierten Menüleiste."
          }
        />
      </div>

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
