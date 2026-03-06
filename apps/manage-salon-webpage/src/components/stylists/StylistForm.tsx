"use client";

import { useState, useRef, useCallback } from "react";
import { Stylist } from "@repo/salon-domain";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAutoSave } from "@/hooks/useAutoSave";

export interface StylistFormData {
  name: string;
  subtitle: string;
  description: string;
  profileImage: string;
}

interface StylistFormProps {
  stylist?: Stylist;
  onSubmit: (data: StylistFormData) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
}

export default function StylistForm({
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
  const [profileImage, setProfileImage] = useState(stylist?.profileImage || "");
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const nameRef = useRef(name);
  nameRef.current = name;
  const subtitleRef = useRef(subtitle);
  subtitleRef.current = subtitle;
  const descriptionRef = useRef(description);
  descriptionRef.current = description;
  const profileImageRef = useRef(profileImage);
  profileImageRef.current = profileImage;

  const initialRef = useRef({
    name: stylist?.name || "",
    subtitle: stylist?.subtitle || "",
    description: stylist?.description || "",
    profileImage: stylist?.profileImage || "",
  });

  const isDirty =
    name !== initialRef.current.name ||
    subtitle !== initialRef.current.subtitle ||
    description !== initialRef.current.description ||
    profileImage !== initialRef.current.profileImage;

  const doSave = useCallback(async () => {
    const trimmedName = nameRef.current.trim();
    const trimmedSubtitle = subtitleRef.current.trim();
    const trimmedDescription = descriptionRef.current.trim();
    const trimmedProfileImage = profileImageRef.current.trim();

    if (
      !trimmedName ||
      !trimmedSubtitle ||
      !trimmedDescription ||
      !trimmedProfileImage
    )
      return;

    await onSubmit({
      name: trimmedName,
      subtitle: trimmedSubtitle,
      description: trimmedDescription,
      profileImage: trimmedProfileImage,
    });

    initialRef.current = {
      name: trimmedName,
      subtitle: trimmedSubtitle,
      description: trimmedDescription,
      profileImage: trimmedProfileImage,
    };
  }, [onSubmit]);

  const triggerAutoSave = useAutoSave(doSave);

  const handleBlur = isEditMode ? () => triggerAutoSave() : undefined;

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

      // Update snapshot after save
      initialRef.current = {
        name: trimmedName,
        subtitle: trimmedSubtitle,
        description: trimmedDescription,
        profileImage: trimmedProfileImage,
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

        <FormInput
          label="Profilbild URL"
          value={profileImage}
          onChange={(value) => {
            setProfileImage(value);
          }}
          onBlur={handleBlur}
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
