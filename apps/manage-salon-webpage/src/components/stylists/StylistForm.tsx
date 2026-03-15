"use client";

import { useState, useRef, useCallback } from "react";
import FormInput from "@/components/website/forms/FormInput";
import FormActions from "@/components/website/forms/FormActions";
import FormTextarea from "@/components/website/forms/FormTextarea";
import MediaSelector from "@/components/media/media-selector";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAutoSave } from "@/hooks/useAutoSave";
import { StylistDto } from "@/app/salon/[salonId]/stylists/stylist.dto";

export interface StylistFormData {
  name: string;
  subtitle: string;
  description: string;
  profileImageMediaId?: string;
}

interface StylistFormProps {
  salonId: string;
  stylist?: StylistDto;
  onSubmit: (data: StylistFormData) => Promise<void>;
  onCancel?: () => void;
}

export default function StylistForm({
  salonId,
  stylist,
  onSubmit,
  onCancel,
}: StylistFormProps) {
  const { showNotification } = useNotifications();
  const isEditMode = !!stylist;
  const [name, setName] = useState(stylist?.name || "");
  const [subtitle, setSubtitle] = useState(stylist?.subtitle || "");
  const [description, setDescription] = useState(stylist?.description || "");
  const [profileImageMediaId, setProfileImageMediaId] = useState<
    string | undefined
  >(stylist?.profileImageMediaId);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const fieldsRef = useRef({
    name,
    subtitle,
    description,
    profileImageMediaId,
  });
  fieldsRef.current = { name, subtitle, description, profileImageMediaId };

  const initialRef = useRef({
    name: stylist?.name || "",
    subtitle: stylist?.subtitle || "",
    description: stylist?.description || "",
    profileImageMediaId: stylist?.profileImageMediaId,
  });

  const isDirty =
    name !== initialRef.current.name ||
    subtitle !== initialRef.current.subtitle ||
    description !== initialRef.current.description ||
    profileImageMediaId !== initialRef.current.profileImageMediaId;

  const doSave = useCallback(async () => {
    const { name, subtitle, description, profileImageMediaId } =
      fieldsRef.current;
    const trimmedName = name.trim();
    const trimmedSubtitle = subtitle.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedSubtitle || !trimmedDescription) return;

    await onSubmit({
      name: trimmedName,
      subtitle: trimmedSubtitle,
      description: trimmedDescription,
      profileImageMediaId,
    });

    initialRef.current = {
      name: trimmedName,
      subtitle: trimmedSubtitle,
      description: trimmedDescription,
      profileImageMediaId,
    };
  }, [onSubmit]);

  const triggerAutoSave = useAutoSave(doSave);

  const handleBlur = isEditMode ? () => triggerAutoSave() : undefined;

  const handleSave = async () => {
    const trimmedName = name.trim();
    const trimmedSubtitle = subtitle.trim();
    const trimmedDescription = description.trim();

    if (!trimmedName || !trimmedSubtitle || !trimmedDescription) {
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
        profileImageMediaId,
      });

      initialRef.current = {
        name: trimmedName,
        subtitle: trimmedSubtitle,
        description: trimmedDescription,
        profileImageMediaId,
      };

      showNotification("Erfolgreich gespeichert", "info", "short");
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
          onBlur={handleBlur}
          placeholder="z.B. Max Mustermann"
          required
        />

        <FormInput
          label="Untertitel"
          value={subtitle}
          onChange={setSubtitle}
          onBlur={handleBlur}
          placeholder="z.B. Salon Master, Stylist, Friseur"
          required
          helperText="Dies wird als Berufsbezeichnung angezeigt"
        />

        <FormTextarea
          label="Beschreibung"
          value={description}
          onChange={setDescription}
          onBlur={handleBlur}
          placeholder="Erzähle etwas über den Stylisten..."
          rows={6}
          required
        />

        <MediaSelector
          salonId={salonId}
          label="Profilbild"
          value={profileImageMediaId}
          onChange={(mediaId) => {
            setProfileImageMediaId(mediaId);
            if (isEditMode) triggerAutoSave();
          }}
          helperText="Wähle ein Profilbild für den Stylisten"
        />

        {error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        {!isEditMode && onCancel && (
          <FormActions
            onCancel={onCancel}
            onSave={handleSave}
            saveLabel={isSaving ? "Speichern..." : "Stylist erstellen"}
            isSaving={isSaving}
            isSaveDisabled={!isDirty}
          />
        )}
      </div>
    </div>
  );
}
