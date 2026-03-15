"use client";

import { useRef, useCallback } from "react";
import type {
  ServiceDefinition,
  ServicePhase,
} from "@/lib/types/service-types";
import { SEAT_SLUG, CLIMAZON_SLUG } from "@/lib/types/service-types";
import FormNumber from "@/components/website/forms/FormNumber";
import FormActions from "@/components/website/forms/FormActions";
import { useServiceFormState } from "./ServiceForm.state";
import ServiceDetailsCard from "./ServiceDetailsCard.component";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAutoSave } from "@/hooks/useAutoSave";

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
      employeeRequired: true,
      requiredResourceSlugs: [SEAT_SLUG],
      order: 0,
    },
    {
      id: crypto.randomUUID(),
      name: "Einwirkzeit",
      durationMinutes: 30,
      employeeRequired: false,
      requiredResourceSlugs: [CLIMAZON_SLUG],
      order: 1,
    },
    {
      id: crypto.randomUUID(),
      name: "Abschluss",
      durationMinutes: 15,
      employeeRequired: true,
      requiredResourceSlugs: [SEAT_SLUG],
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
  const isEditMode = !!service;

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

  const stateRef = useRef(state);
  stateRef.current = state;

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

  const doSave = useCallback(async () => {
    const s = stateRef.current;
    const trimmedName = s.name.trim();
    if (!trimmedName) return;

    for (const phase of s.phases) {
      if (phase.durationMinutes <= 0) return;
    }

    await onSubmit({
      name: trimmedName,
      description: s.description.trim(),
      priceInCents: s.priceInCents,
      phases: s.phases,
    });

    initialRef.current = {
      name: trimmedName,
      description: s.description.trim(),
      priceInCents: s.priceInCents,
      phases: JSON.stringify(s.phases),
    };
  }, [onSubmit]);

  const triggerAutoSave = useAutoSave(doSave);

  const handleBlur = isEditMode ? () => triggerAutoSave() : undefined;

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
    <div className="space-y-lg">
      <ServiceDetailsCard
        name={state.name}
        description={state.description}
        priceInCents={state.priceInCents}
        namePlaceholder="z.B. Coloration"
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onPriceChange={setPrice}
        onBlur={handleBlur}
      />

      <div>
        <h3 className="text-lg font-focus text-fg-strong">Phasen und Dauer</h3>
        <p className="text-sm text-fg-muted">
          Gesamtdauer: {totalDuration} Minuten
        </p>
      </div>

      <div className="grid grid-cols-[repeat(auto-fit,minmax(200px,1fr))] gap-md">
        {state.phases.map((phase, index) => (
          <div
            key={phase.id}
            className="bg-bg-1 border border-border rounded-lg p-md"
          >
            <div className="font-focus text-fg-normal text-base">
              {PHASE_LABELS[index]}
            </div>
            <FormNumber
              label="Dauer (Minuten)"
              value={phase.durationMinutes}
              onChange={(durationMinutes) =>
                updatePhase(phase.id, { durationMinutes })
              }
              onBlur={handleBlur}
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

      {!isEditMode && (
        <FormActions
          onCancel={onCancel}
          onSave={handleSave}
          saveLabel={state.isSaving ? "Speichern..." : saveLabel || "Speichern"}
          isSaving={state.isSaving}
          isSaveDisabled={!isDirty}
        />
      )}
    </div>
  );
}
