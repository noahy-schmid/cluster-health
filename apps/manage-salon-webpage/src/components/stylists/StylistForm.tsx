"use client";

import { useState } from "react";
import { Stylist } from "@repo/salon-domain";
import { createStylist, updateStylist } from "@/api/stylists-actions";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormActions from "@/components/website/forms/FormActions";

interface StylistFormProps {
  salonId: string;
  stylist?: Stylist;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function StylistForm({
  salonId,
  stylist,
  onSuccess,
  onCancel,
}: StylistFormProps) {
  const [name, setName] = useState(stylist?.name || "");
  const [subtitle, setSubtitle] = useState(stylist?.subtitle || "");
  const [description, setDescription] = useState(stylist?.description || "");
  const [profileImage, setProfileImage] = useState(stylist?.profileImage || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const handleSave = async () => {
    if (!name || !subtitle || !description || !profileImage) {
      setError("Bitte fülle alle Pflichtfelder aus");
      return;
    }

    setIsSaving(true);
    setError(undefined);

    try {
      let result;
      if (stylist) {
        // Update existing stylist
        result = await updateStylist(salonId, stylist.id, {
          name,
          subtitle,
          description,
          profileImage,
        });
      } else {
        // Create new stylist
        result = await createStylist({
          salonId,
          name,
          subtitle,
          description,
          profileImage,
        });
      }

      if (!result.success) {
        setError(result.error || "Fehler beim Speichern");
        setIsSaving(false);
        return;
      }

      onSuccess();
    } catch (err) {
      console.error("Error saving stylist:", err);
      setError("Ein unerwarteter Fehler ist aufgetreten");
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
          onChange={setProfileImage}
          placeholder="https://example.com/image.jpg"
          type="url"
          required
          helperText="Gib die URL zum Profilbild ein"
        />

        {profileImage && (
          <div className="flex flex-col gap-sm">
            <label className="text-sm font-normal text-fg-strong">
              Vorschau
            </label>
            <div className="aspect-square max-w-xs rounded-lg overflow-hidden">
              <img
                src={profileImage}
                alt="Vorschau"
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.currentTarget.src = "";
                  e.currentTarget.alt = "Bild konnte nicht geladen werden";
                }}
              />
            </div>
          </div>
        )}

        {error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <FormActions
          onCancel={onCancel}
          onSave={handleSave}
          saveLabel={
            isSaving
              ? "Speichern..."
              : stylist
                ? "Änderungen speichern"
                : "Stylist erstellen"
          }
          cancelLabel="Abbrechen"
        />
      </div>
    </div>
  );
}
