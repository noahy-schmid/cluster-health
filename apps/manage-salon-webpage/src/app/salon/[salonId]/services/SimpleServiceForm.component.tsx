"use client";

import { useRef, useCallback } from "react";
import type { ServiceDefinition } from "@/lib/types/service-types";
import { SEAT_RESOURCE_ID } from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormNumber from "@/components/website/forms/FormNumber";
import FormMoney from "@/components/website/forms/FormMoney";
import { useServiceFormState } from "./ServiceForm.state";
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
    requiresEmployee: true,
    requiredResources: [
      { resourceId: SEAT_RESOURCE_ID, resourceName: "Stuhl" },
    ],
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
    <div className="bg-bg-1 rounded-lg p-lg">
      <div className="space-y-lg">
        <FormInput
          label="Name"
          value={state.name}
          onChange={setName}
          onBlur={handleBlur}
          placeholder="z.B. Haarschnitt Damen"
          required
        />

        <FormTextarea
          label="Beschreibung"
          value={state.description}
          onChange={setDescription}
          onBlur={handleBlur}
          placeholder="Beschreibe die Dienstleistung..."
          rows={3}
        />

        <FormMoney
          label="Preis"
          value={state.priceInCents}
          onChange={setPrice}
          onBlur={handleBlur}
          min={0}
          max={100000}
        />

        {phase && (
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
        )}

        {state.error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        {!isEditMode && (
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
        )}
      </div>
    </div>
  );
}
