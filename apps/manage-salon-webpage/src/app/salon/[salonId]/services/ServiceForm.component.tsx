"use client";

import { useMemo, useRef, useCallback } from "react";
import { Plus } from "lucide-react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import type { ServiceDefinition, Resource } from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormMoney from "@/components/website/forms/FormMoney";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import PhaseEditor from "./PhaseEditor.component";
import { useServiceFormState } from "./ServiceForm.state";
import { useNotifications } from "@/components/notifications/useNotifications";
import { useAutoSave } from "@/hooks/useAutoSave";

interface ServiceFormProps {
  service?: ServiceDefinition;
  availableResources: Resource[];
  onSubmit: (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: ServiceDefinition["phases"];
  }) => Promise<void>;
  onCancel?: () => void;
  saveLabel?: string;
}

export default function ServiceForm({
  service,
  availableResources,
  onSubmit,
  onCancel,
  saveLabel,
}: ServiceFormProps) {
  const { showNotification } = useNotifications();
  const isEditMode = !!service;
  const {
    state,
    setName,
    setDescription,
    setPrice,
    addPhase,
    removePhase,
    updatePhase,
    reorderPhases,
    setSaving,
    setError,
    clearError,
  } = useServiceFormState({
    name: service?.name,
    description: service?.description,
    priceInCents: service?.priceInCents,
    phases: service?.phases,
  });

  const stateRef = useRef(state);
  stateRef.current = state;

  // Track the initial snapshot to detect changes
  const initialRef = useRef({
    name: service?.name ?? "",
    description: service?.description ?? "",
    priceInCents: service?.priceInCents ?? 0,
    phases: JSON.stringify(service?.phases ?? []),
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
    if (s.phases.length === 0) return;
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

  const handleFormBlur = isEditMode ? () => triggerAutoSave() : undefined;

  const handlePhaseBlur = useCallback(
    (_phase: ServiceDefinition["phases"][number]) => {
      if (isEditMode) {
        triggerAutoSave();
      }
    },
    [isEditMode, triggerAutoSave],
  );

  const handleRemovePhase = useCallback(
    (phaseId: string) => {
      removePhase(phaseId);

      if (isEditMode) {
        triggerAutoSave();
      }
    },
    [isEditMode, removePhase, triggerAutoSave],
  );

  const handlePhaseUpdate = useCallback(
    (phase: ServiceDefinition["phases"][number]) => {
      updatePhase(phase.id, phase);
    },
    [updatePhase],
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const phaseIds = useMemo(() => state.phases.map((p) => p.id), [state.phases]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = state.phases.findIndex((p) => p.id === active.id);
    const newIndex = state.phases.findIndex((p) => p.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const next = [...state.phases];
    const [moved] = next.splice(oldIndex, 1);
    next.splice(newIndex, 0, moved);
    reorderPhases(next);
  };

  const handleSave = async () => {
    clearError();

    const trimmedName = state.name.trim();
    const trimmedDescription = state.description.trim();

    if (!trimmedName) {
      setError("Bitte gib einen Namen für die Dienstleistung ein");
      return;
    }

    if (state.phases.length === 0) {
      setError("Bitte füge mindestens eine Phase hinzu");
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

      // After successful save, update the initial snapshot so isDirty becomes false
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
          onBlur={handleFormBlur}
          placeholder="z.B. Haarschnitt Damen"
          required
        />

        <FormTextarea
          label="Beschreibung"
          value={state.description}
          onChange={setDescription}
          onBlur={handleFormBlur}
          placeholder="Beschreibe die Dienstleistung..."
          rows={3}
        />

        <FormMoney
          label="Preis"
          value={state.priceInCents}
          onChange={setPrice}
          onBlur={handleFormBlur}
          min={0}
          max={100000}
        />

        {/* Phases section */}
        <div className="flex flex-col gap-md">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-focus text-fg-strong">Phasen</h3>
              {state.phases.length > 0 && (
                <p className="text-sm text-fg-muted">
                  Gesamtdauer: {totalDuration} Minuten
                </p>
              )}
            </div>
            <FlatIconTextButton
              icon={Plus}
              text="Phase hinzufügen"
              onClick={addPhase}
              elevation={0}
            />
          </div>

          {state.phases.length === 0 && (
            <div className="text-center py-lg border border-dashed border-border rounded-lg">
              <p className="text-fg-muted text-sm">
                Noch keine Phasen vorhanden. Füge eine Phase hinzu um den Ablauf
                der Dienstleistung zu definieren.
              </p>
            </div>
          )}

          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={phaseIds}
              strategy={verticalListSortingStrategy}
            >
              <div className="space-y-md">
                {state.phases.map((phase, index) => (
                  <PhaseEditor
                    key={phase.id}
                    phase={phase}
                    index={index}
                    availableResources={availableResources}
                    onUpdate={handlePhaseUpdate}
                    onRemove={() => handleRemovePhase(phase.id)}
                    onBlur={handlePhaseBlur}
                  />
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </div>

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
