"use client";

import { useRef, useCallback } from "react";
import type { ServiceDefinition } from "@/lib/types/service-types";
import { SEAT_SLUG } from "@/lib/types/service-types";
import FormNumber from "@/components/website/forms/FormNumber";
import FormActions from "@/components/website/forms/FormActions";
import { useServiceFormState } from "./ServiceForm.state";
import ServiceDetailsCard from "./ServiceDetailsCard.component";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAutoSave } from "@/hooks/useAutoSave";

interface SimpleServiceFormProps {
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

function createSimplePhase(durationMinutes: number) {
  return {
    id: crypto.randomUUID(),
    name: "Durchführung",
    durationMinutes,
    employeeRequired: true,
    requiredResourceSlugs: [SEAT_SLUG],
    order: 0,
  };
}

export default function SimpleServiceForm({
  service,
  onSubmit,
  onCancel,
  saveLabel,
}: SimpleServiceFormProps) {
  const { showNotification } = useNotifications();
  const initialPhase = service?.phases[0];
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
    phases: initialPhase ? [initialPhase] : [createSimplePhase(30)],
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  const initialRef = useRef({
    name: service?.name ?? "",
    description: service?.description ?? "",
    priceInCents: service?.priceInCents ?? 0,
    duration: initialPhase?.durationMinutes ?? 30,
  });

  const phase = state.phases[0];
  const isDirty =
    state.name !== initialRef.current.name ||
    state.description !== initialRef.current.description ||
    state.priceInCents !== initialRef.current.priceInCents ||
    (phase?.durationMinutes ?? 30) !== initialRef.current.duration;

  const doSave = useCallback(async () => {
    const s = stateRef.current;
    const trimmedName = s.name.trim();
    if (!trimmedName) return;

    await onSubmit({
      name: trimmedName,
      description: s.description.trim(),
      priceInCents: s.priceInCents,
      phases: s.phases,
    });

    const currentPhase = s.phases[0];
    initialRef.current = {
      name: trimmedName,
      description: s.description.trim(),
      priceInCents: s.priceInCents,
      duration: currentPhase?.durationMinutes ?? 30,
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
        duration: phase?.durationMinutes ?? 30,
      };

      showNotification("Erfolgreich gespeichert", "info", "short");
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-lg">
      <ServiceDetailsCard
        name={state.name}
        description={state.description}
        priceInCents={state.priceInCents}
        onNameChange={setName}
        onDescriptionChange={setDescription}
        onPriceChange={setPrice}
        onBlur={handleBlur}
      />

      {phase && (
        <div className="bg-bg-1 border border-border rounded-lg p-md">
          <div className="font-focus text-fg-normal text-base">
            Durchführung
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
      )}

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
