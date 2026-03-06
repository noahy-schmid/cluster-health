"use client";

import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormMoney from "@/components/website/forms/FormMoney";

interface ServiceDetailsCardProps {
  name: string;
  description: string;
  priceInCents: number;
  namePlaceholder?: string;
  descriptionPlaceholder?: string;
  onNameChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onPriceChange: (value: number) => void;
  onBlur?: () => void;
}

export default function ServiceDetailsCard({
  name,
  description,
  priceInCents,
  namePlaceholder = "z.B. Haarschnitt Damen",
  descriptionPlaceholder = "Beschreibe die Dienstleistung...",
  onNameChange,
  onDescriptionChange,
  onPriceChange,
  onBlur,
}: ServiceDetailsCardProps) {
  return (
    <div className="bg-bg-1 rounded-lg p-lg border border-border">
      <div className="space-y-lg">
        <FormInput
          label="Name"
          value={name}
          onChange={onNameChange}
          onBlur={onBlur}
          placeholder={namePlaceholder}
          required
        />

        <FormTextarea
          label="Beschreibung"
          value={description}
          onChange={onDescriptionChange}
          onBlur={onBlur}
          placeholder={descriptionPlaceholder}
          rows={3}
        />

        <FormMoney
          label="Preis"
          value={priceInCents}
          onChange={onPriceChange}
          onBlur={onBlur}
          min={0}
          max={100000}
        />
      </div>
    </div>
  );
}
