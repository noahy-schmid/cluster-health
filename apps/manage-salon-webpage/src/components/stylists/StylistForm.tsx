"use client";

import { useState, useRef, useCallback } from "react";
import { Stylist } from "@repo/salon-domain";
import { Option } from "effect";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import MediaSelector from "@/components/media/media-selector";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAutoSave } from "@/hooks/useAutoSave";

export interface StylistFormData {
  name: string;
  subtitle: string;
  description: string;
  profileImageMediaId: Option.Option<string>;
}

interface StylistFormProps {
  salonId: string;
  stylist?: Stylist;
  onSubmit: (data: StylistFormData) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
}

export default function StylistForm({
  salonId,
  stylist,
  onSubmit,
  onCancel,
  saveLabel,
}: StylistFormProps) {
  const { showNotification } = useNotifications();
  const isEditMode = !!stylist;
  const [name, setName] = useState(stylist?.name || "");
  const [subtitle, setSubtitle] = useState(stylist?.subtitle || "");
  const [description, setDescription] = useState(stylist?.description || "");
  const [profileImageMediaId, setProfileImageMediaId] = useState<
    string | undefined
  >(Option.getOrUndefined(stylist?.profileImageMediaId ?? Option.none()));
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
    profileImageMediaId: Option.getOrUndefined(
      stylist?.profileImageMediaId ?? Option.none(),
    ),
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
      profileImageMediaId: profileImageMediaId
        ? Option.some(profileImageMediaId)
        : Option.none(),
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
        profileImageMediaId: profileImageMediaId
          ? Option.some(profileImageMediaId)
          : Option.none(),
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

        {!isEditMode && (
          <div className="flex gap-md justify-end pt-lg">
            {onCancel && (
              <button
                type="button"
                onClick={onCancel}
                className="px-lg py-sm border border-border rounded-md text-fg-normal text-base font-unfocus hover:bg-bg-0 transition-colors cursor-pointer"
                disabled={isSaving}
              >
                Abbrechen
              </button>
            )}
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || !isDirty}
              className="px-lg py-sm bg-primary-500 text-fg-inv rounded-md text-base font-focus hover:bg-primary-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? "Speichern..." : saveLabel || "Speichern"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
