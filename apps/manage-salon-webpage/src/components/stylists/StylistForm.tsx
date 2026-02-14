"use client";

import { useState } from "react";
import { Stylist } from "@repo/salon-domain";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormActions from "@/components/website/forms/FormActions";

export interface StylistFormData {
  name: string;
  subtitle: string;
  description: string;
  profileImage: string;
}

interface StylistFormProps {
  stylist?: Stylist;
  onSubmit: (data: StylistFormData) => Promise<void>;
  onCancel: () => void;
  saveLabel?: string;
}

export default function StylistForm({
  stylist,
  onSubmit,
  onCancel,
  saveLabel,
}: StylistFormProps) {
  const [name, setName] = useState(stylist?.name || "");
  const [subtitle, setSubtitle] = useState(stylist?.subtitle || "");
  const [description, setDescription] = useState(stylist?.description || "");
  const [profileImage, setProfileImage] = useState(stylist?.profileImage || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    // Trim whitespace and validate
    const trimmedName = name.trim();
    const trimmedSubtitle = subtitle.trim();
    const trimmedDescription = description.trim();
    const trimmedProfileImage = profileImage.trim();

    if (
      !trimmedName ||
      !trimmedSubtitle ||
      !trimmedDescription ||
      !trimmedProfileImage
    ) {
      setError("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      await onSubmit({
        name: trimmedName,
        subtitle: trimmedSubtitle,
        description: trimmedDescription,
        profileImage: trimmedProfileImage,
      });
    } catch (err) {
      console.error("Error saving stylist:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-bg-1 rounded-lg p-lg">
      <div className="space-y-lg">
        <FormInput
          label="Name"
          value={name}
          onChange={setName}
          placeholder="z.B. Max Mustermann"
          required
        />

        <FormInput
          label="Untertitel"
          value={subtitle}
          onChange={setSubtitle}
          placeholder="z.B. Salon Master, Stylist, Friseur"
          required
          helperText="Dies wird als Berufsbezeichnung angezeigt"
        />

        <FormTextarea
          label="Beschreibung"
          value={description}
          onChange={setDescription}
          placeholder="Erzähle etwas über den Stylisten..."
          rows={6}
          required
        />

        <FormInput
          label="Profilbild URL"
          value={profileImage}
          onChange={(value) => {
            setProfileImage(value);
          }}
          placeholder="https://example.com/image.jpg"
          type="url"
          required
          helperText="Gib die URL zum Profilbild ein"
        />

        {error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <FormActions
          onCancel={onCancel}
          onSave={handleSave}
          saveLabel={isSaving ? "Speichern..." : saveLabel || "Speichern"}
          cancelLabel="Abbrechen"
          isSaving={isSaving}
        />
      </div>
    </div>
  );
}
