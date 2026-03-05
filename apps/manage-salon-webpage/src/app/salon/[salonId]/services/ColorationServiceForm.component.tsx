"use client";

import { useRef } from "react";
import type {
  ServiceDefinition,
  ServicePhase,
} from "@/lib/types/service-types";
import {
  SEAT_RESOURCE_ID,
  HEATING_LAMP_RESOURCE_ID,
} from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormNumber from "@/components/website/forms/FormNumber";
import FormMoney from "@/components/website/forms/FormMoney";
import { useServiceFormState } from "./ServiceForm.state";
import { useNotifications } from "@/components/notifications/useNotifications";

interface ColorationServiceFormProps {
  service?: ServiceDefinition;
  onSubmit: (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: ServiceDefinition["phases"];
  }) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
}

function createColorationPhases(): ServicePhase[] {
  return [
    {
      id: crypto.randomUUID(),
      name: "Färben",
      durationMinutes: 20,
      requiresEmployee: true,
      requiredResources: [
        { resourceId: SEAT_RESOURCE_ID, resourceName: "Stuhl" },
      ],
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      name: "Einwirkzeit",
      durationMinutes: 30,
      requiresEmployee: false,
      requiredResources: [
        { resourceId: HEATING_LAMP_RESOURCE_ID, resourceName: "Wärmehaube" },
      ],
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: "Abschluss",
      durationMinutes: 15,
      requiresEmployee: true,
      requiredResources: [
        { resourceId: SEAT_RESOURCE_ID, resourceName: "Stuhl" },
      ],
      order: 2,
    },
  ];
}

const PHASE_LABELS = ["Färben", "Einwirkzeit", "Abschluss"] as const;

export default function ColorationServiceForm({
  service,
  onSubmit,
  onCancel,
  saveLabel,
}: ColorationServiceFormProps) {
  const { showNotification } = useNotifications();

  const {
    state,
    setName,
    setDescription,
    setPrice,
    updatePhase,
    setSaving,
    setError,
    clearError,
  } = useServiceFormState({
    name: service?.name,
    description: service?.description,
    priceInCents: service?.priceInCents,
    phases:
      service?.phases && service.phases.length === 3
        ? service.phases
        : createColorationPhases(),
  });

  const initialRef = useRef({
    name: service?.name ?? "",
    description: service?.description ?? "",
    priceInCents: service?.priceInCents ?? 0,
    phases: JSON.stringify(
      service?.phases && service.phases.length === 3
        ? service.phases
        : createColorationPhases(),
    ),
  });

  const isDirty =
    state.name !== initialRef.current.name ||
    state.description !== initialRef.current.description ||
    state.priceInCents !== initialRef.current.priceInCents ||
    JSON.stringify(state.phases) !== initialRef.current.phases;

  const handleSave = async () => {
    clearError();

    const trimmedName = state.name.trim();
    const trimmedDescription = state.description.trim();

    if (!trimmedName) {
      setError("Bitte gib einen Namen für die Dienstleistung ein");
      return;
    }

    for (const phase of state.phases) {
      if (phase.durationMinutes <= 0) {
        setError("Alle Phasen müssen eine Dauer größer als 0 haben");
        return;
      }
    }

    setSaving(true);
    try {
      await onSubmit({
        name: trimmedName,
        description: trimmedDescription,
        priceInCents: state.priceInCents,
        phases: state.phases,
      });

      initialRef.current = {
        name: trimmedName,
        description: trimmedDescription,
        priceInCents: state.priceInCents,
        phases: JSON.stringify(state.phases),
      };

      showNotification("Erfolgreich gespeichert", "info", "short");
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  };

  const totalDuration = state.phases.reduce(
    (sum, p) => sum + p.durationMinutes,
    0,
  );

  return (
    <div className="bg-bg-1 rounded-lg p-lg">
      <div className="space-y-lg">
        <FormInput
          label="Name"
          value={state.name}
          onChange={setName}
          placeholder="z.B. Coloration"
          required
        />

        <FormTextarea
          label="Beschreibung"
          value={state.description}
          onChange={setDescription}
          placeholder="Beschreibe die Dienstleistung..."
          rows={3}
        />

        <FormMoney
          label="Preis"
          value={state.priceInCents}
          onChange={setPrice}
          min={0}
          max={100000}
        />

        <div className="flex flex-col gap-md">
          <div>
            <h3 className="text-base font-focus text-fg-strong">Phasen</h3>
            <p className="text-sm text-fg-muted">
              Gesamtdauer: {totalDuration} Minuten
            </p>
          </div>

          {state.phases.map((phase, index) => (
            <div
              key={phase.id}
              className="bg-bg-0 border border-border rounded-lg p-md"
            >
              <div className="flex items-center gap-sm mb-md">
                <span className="text-sm font-focus text-fg-muted">
                  Phase {index + 1}: {PHASE_LABELS[index]}
                </span>
              </div>
              <FormNumber
                label="Dauer (Minuten)"
                value={phase.durationMinutes}
                onChange={(durationMinutes) =>
                  updatePhase(phase.id, { durationMinutes })
                }
                min={1}
                max={480}
              />
            </div>
          ))}
        </div>

        {state.error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <div className="flex gap-md justify-end pt-lg">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-lg py-sm border border-border rounded-md text-fg-normal text-base font-unfocus hover:bg-bg-0 transition-colors cursor-pointer"
              disabled={state.isSaving}
            >
              Abbrechen
            </button>
          )}
          <button
            type="button"
            onClick={handleSave}
            disabled={state.isSaving || !isDirty}
            className="px-lg py-sm bg-primary-500 text-fg-inv rounded-md text-base font-focus hover:bg-primary-600 transition-colors cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {state.isSaving ? "Speichern..." : saveLabel || "Speichern"}
          </button>
        </div>
      </div>
    </div>
  );
}
