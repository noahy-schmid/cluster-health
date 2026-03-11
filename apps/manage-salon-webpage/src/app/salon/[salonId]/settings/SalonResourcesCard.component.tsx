"use client";

import type { ReactNode } from "react";
import { Plus, Trash2 } from "lucide-react";
import FormInput from "@/components/website/forms/FormInput";
import FormNumber from "@/components/website/forms/FormNumber";
import FlatIconButton from "@/components/buttons/FlatIconButton";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import SettingsCard from "./SettingsCard.component";
import type { CustomResourceDraft } from "./salon-resources.state";

interface SalonResourcesCardProps {
  seatAmount: number;
  climazonAmount: number;
  customResources: CustomResourceDraft[];
  resourceError?: string;
  footer?: ReactNode;
  onSeatChange: (amount: number) => void;
  onSeatBlur: () => void;
  onClimazonChange: (amount: number) => void;
  onClimazonBlur: () => void;
  onCustomNameChange: (resourceId: string, name: string) => void;
  onCustomAmountChange: (resourceId: string, amount: number) => void;
  onCustomBlur: (resourceId: string) => void;
  onAddCustomResource: () => void;
  onRemoveCustomResource: (resourceId: string) => void;
}

export default function SalonResourcesCard({
  seatAmount,
  climazonAmount,
  customResources,
  resourceError,
  footer,
  onSeatChange,
  onSeatBlur,
  onClimazonChange,
  onClimazonBlur,
  onCustomNameChange,
  onCustomAmountChange,
  onCustomBlur,
  onAddCustomResource,
  onRemoveCustomResource,
}: SalonResourcesCardProps) {
  return (
    <SettingsCard
      title="Terminplanung"
      description="Pflegen Sie Bedienplätze, Geräte und weitere Angaben, die Ihre Terminverfügbarkeit beeinflussen."
    >
      <div className="grid gap-md md:grid-cols-2">
        <FormNumber
          label="Bedienplätze"
          value={seatAmount}
          min={0}
          onChange={onSeatChange}
          onBlur={onSeatBlur}
        />
        <FormNumber
          label="Climazons"
          value={climazonAmount}
          min={0}
          onChange={onClimazonChange}
          onBlur={onClimazonBlur}
        />
      </div>
      <div className="text-sm text-fg-muted">
        Die Angaben über Bedienplätze und Climazons sollten der Anzahl im Salon
        entsprechen, damit die Terminplanung korrekt funktioniert.
      </div>

      <div className="space-y-md">
        <div className="flex items-center justify-between gap-md">
          <div>
            <h3 className="text-base font-focus text-fg-strong">
              Weitere Ausstattung
            </h3>
            <p className="text-sm text-fg-muted">
              Ergänzen Sie weitere Geräte oder Plätze, die für Ihre
              Terminplanung relevant sind.
            </p>
          </div>
          <FlatIconTextButton
            icon={Plus}
            text="Ausstattung hinzufügen"
            onClick={onAddCustomResource}
            elevation={1}
          />
        </div>

        {customResources.length === 0 && (
          <div className="rounded-md border border-dashed border-border px-md py-lg text-sm text-fg-muted">
            Noch keine zusätzliche Ausstattung angelegt.
          </div>
        )}

        {customResources.map((resource) => (
          <div
            key={resource.id}
            className="rounded-md border border-border bg-bg-0 p-md"
          >
            <div className="grid gap-md md:grid-cols-[minmax(0,1fr)_auto_auto] md:items-start">
              <FormInput
                label="Name"
                value={resource.name}
                onChange={(value) => onCustomNameChange(resource.id, value)}
                onBlur={() => onCustomBlur(resource.id)}
                placeholder="z.B. Waschplatz"
              />
              <FormNumber
                label="Anzahl"
                value={resource.amount}
                min={1}
                onChange={(value) => onCustomAmountChange(resource.id, value)}
                onBlur={() => onCustomBlur(resource.id)}
              />
              <div className="flex items-end justify-end">
                <FlatIconButton
                  icon={Trash2}
                  onClick={() => onRemoveCustomResource(resource.id)}
                  elevation={0}
                  isError
                  ariaLabel="Ausstattung löschen"
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      {resourceError && (
        <div className="rounded-md border border-red-200 bg-red-50 p-md">
          <p className="text-sm text-red-700">{resourceError}</p>
        </div>
      )}

      {footer}
    </SettingsCard>
  );
}
