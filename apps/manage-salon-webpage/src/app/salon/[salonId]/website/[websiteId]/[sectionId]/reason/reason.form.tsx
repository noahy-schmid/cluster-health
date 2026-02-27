"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateSection } from "@/api/sections-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import {
  AllSections,
  ReasonSettings,
  ReasonItem,
} from "@repo/website-database";
import { PlusIcon, TrashIcon } from "lucide-react";
import FormInput from "@/components/website/forms/FormInput";
import FormActions from "@/components/website/forms/FormActions";
import FormTextarea from "@/components/website/forms/FormTextarea";
import MediaSelector from "@/components/media/media-selector";

interface ReasonFormProps {
  section: Extract<AllSections, { type: "reason" }>;
}

export default function ReasonForm({ section }: ReasonFormProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [settings, setSettings] = useState<ReasonSettings>(section.settings);
  const [menuTitle, setMenuTitle] = useState<string>(section.menuTitle || "");
  const [validationError, setValidationError] = useState<string>("");

  const validateItems = (items: ReasonItem[]): string => {
    if (items.length < 2) {
      return "Mindestens 2 Grunde erforderlich";
    }
    if (items.length > 4) {
      return "Maximal 4 Grunde erlaubt";
    }

    const itemsWithImages = items.filter(
      (item) => item.imageId && item.imageId.trim() !== "",
    );
    if (itemsWithImages.length > 0 && itemsWithImages.length !== items.length) {
      return "Entweder alle Grunde mussen Bilder haben oder keiner";
    }

    return "";
  };

  const handleSave = async () => {
    const error = validateItems(settings.items);
    if (error) {
      setValidationError(error);
      return;
    }

    await updateSection(websiteId ?? "", {
      ...section,
      settings,
      menuTitle: menuTitle.trim() === "" ? undefined : menuTitle.trim(),
    });
    router.replace(`/salon/${salonId}/website/${websiteId}`);
  };

  const addItem = () => {
    if (settings.items.length >= 4) {
      setValidationError("Maximal 4 Grunde erlaubt");
      return;
    }
    setSettings({
      ...settings,
      items: [
        ...settings.items,
        { title: "", description: "", imageId: undefined },
      ],
    });
    setValidationError("");
  };

  const removeItem = (index: number) => {
    const newItems = settings.items.filter((_, i) => i !== index);
    setSettings({ ...settings, items: newItems });
    setValidationError(validateItems(newItems));
  };

  const updateItem = (
    index: number,
    field: keyof ReasonItem,
    value: string,
  ) => {
    const newItems = [...settings.items];
    newItems[index] = { ...newItems[index], [field]: value };
    setSettings({ ...settings, items: newItems });
    setValidationError(validateItems(newItems));
  };

  return (
    <div className="flex flex-col gap-lg">
      <FormInput
        label="Menu Titel (optional)"
        value={menuTitle}
        onChange={(value) => setMenuTitle(value)}
        placeholder="Abschnitt im Menu anzeigen"
        helperText="Wenn ein Titel angegeben wird, erscheint dieser Abschnitt im Navigationsmenu"
      />

      <FormInput
        label="Titel"
        value={settings.title}
        onChange={(value) => setSettings({ ...settings, title: value })}
        placeholder="Haupttitel eingeben"
        required
      />

      <FormInput
        label="Untertitel"
        value={settings.subtitle}
        onChange={(value) => setSettings({ ...settings, subtitle: value })}
        placeholder="Untertitel eingeben"
        required
      />

      <div className="flex flex-col gap-sm">
        <label className="text-sm font-normal text-fg-strong">
          Grunde (2-4 erforderlich)
        </label>

        {settings.items.map((item, index) => (
          <div
            key={index}
            className="p-md bg-bg-0 rounded-md border border-border flex flex-col gap-sm"
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium text-fg-normal">
                Grund {index + 1}
              </span>
              {settings.items.length > 2 && (
                <button
                  type="button"
                  onClick={() => removeItem(index)}
                  className="p-sm text-fg-muted hover:text-red-700 rounded-md transition-colors"
                  aria-label="Grund entfernen"
                >
                  <TrashIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            <FormInput
              label="Titel"
              value={item.title}
              onChange={(value) => updateItem(index, "title", value)}
              placeholder="Grund Titel"
              required
            />

            <FormTextarea
              label="Beschreibung"
              value={item.description}
              onChange={(value) => updateItem(index, "description", value)}
              placeholder="Grund Beschreibung"
              required
            />

            <MediaSelector
              label="Bild (optional)"
              salonId={salonId!}
              value={item.imageId}
              onChange={(value) => {
                const newItems = [...settings.items];
                newItems[index] = { ...newItems[index], imageId: value };
                setSettings({ ...settings, items: newItems });
                setValidationError(validateItems(newItems));
              }}
            />
          </div>
        ))}

        {settings.items.length < 4 && (
          <button
            type="button"
            onClick={addItem}
            className="flex items-center gap-sm px-md py-sm border border-dashed border-border rounded-md text-fg-normal hover:border-primary-700 hover:text-primary-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5" />
            <span>Grund hinzufugen</span>
          </button>
        )}

        {validationError && (
          <p className="text-sm text-red-600">{validationError}</p>
        )}
      </div>

      <FormActions
        onCancel={() =>
          router.replace(`/salon/${salonId}/website/${websiteId}`)
        }
        onSave={handleSave}
      />
    </div>
  );
}
