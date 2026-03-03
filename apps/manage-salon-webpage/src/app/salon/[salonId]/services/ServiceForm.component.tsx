"use client";

import { Plus } from "lucide-react";
import type {
  ServiceDefinition,
  SalonResource,
} from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormTextarea from "@/components/website/forms/FormTextarea";
import FormActions from "@/components/website/forms/FormActions";
import PhaseEditor from "./PhaseEditor.component";
import { useServiceFormState } from "./ServiceForm.state";

interface ServiceFormProps {
  service?: ServiceDefinition;
  availableResources: SalonResource[];
  onSubmit: (data: {
    name: string;
    description: string;
    phases: ServiceDefinition["phases"];
  }) => Promise<void>;
  onCancel: () => void;
  saveLabel?: string;
}

export default function ServiceForm({
  service,
  availableResources,
  onSubmit,
  onCancel,
  saveLabel,
}: ServiceFormProps) {
  const {
    state,
    setName,
    setDescription,
    addPhase,
    removePhase,
    updatePhaseName,
    updatePhaseDuration,
    updatePhaseRequiresEmployee,
    addPhaseResource,
    removePhaseResource,
    reorderPhases,
    setSaving,
    setError,
    clearError,
  } = useServiceFormState({
    name: service?.name,
    description: service?.description,
    phases: service?.phases,
  });

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
        phases: state.phases,
      });
    } catch {
      setError("Ein unerwarteter Fehler ist aufgetreten");
    } finally {
      setSaving(false);
    }
  };

  const handleMovePhase = (fromIndex: number, direction: "up" | "down") => {
    const toIndex = direction === "up" ? fromIndex - 1 : fromIndex + 1;
    if (toIndex < 0 || toIndex >= state.phases.length) return;

    const newPhases = [...state.phases];
    const [moved] = newPhases.splice(fromIndex, 1);
    newPhases.splice(toIndex, 0, moved);
    reorderPhases(newPhases);
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
          placeholder="z.B. Haarschnitt Damen"
          required
        />

        <FormTextarea
          label="Beschreibung"
          value={state.description}
          onChange={setDescription}
          placeholder="Beschreibe die Dienstleistung..."
          rows={3}
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
            <button
              onClick={addPhase}
              className="flex items-center gap-1 px-sm py-1 rounded-md text-sm text-primary-700 hover:bg-primary-50 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Phase hinzufügen
            </button>
          </div>

          {state.phases.length === 0 && (
            <div className="text-center py-lg border border-dashed border-border rounded-lg">
              <p className="text-fg-muted text-sm">
                Noch keine Phasen vorhanden. Füge eine Phase hinzu um den Ablauf
                der Dienstleistung zu definieren.
              </p>
            </div>
          )}

          <div className="space-y-md">
            {state.phases.map((phase, index) => (
              <div key={phase.id}>
                {/* Reorder buttons */}
                <div className="flex gap-1 mb-1 ml-md">
                  <button
                    onClick={() => handleMovePhase(index, "up")}
                    disabled={index === 0}
                    className="text-xs text-fg-muted hover:text-fg-normal disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ↑ Hoch
                  </button>
                  <button
                    onClick={() => handleMovePhase(index, "down")}
                    disabled={index === state.phases.length - 1}
                    className="text-xs text-fg-muted hover:text-fg-normal disabled:opacity-30 cursor-pointer disabled:cursor-not-allowed"
                  >
                    ↓ Runter
                  </button>
                </div>
                <PhaseEditor
                  phase={phase}
                  index={index}
                  availableResources={availableResources}
                  onUpdateName={(name) => updatePhaseName(phase.id, name)}
                  onUpdateDuration={(d) => updatePhaseDuration(phase.id, d)}
                  onUpdateRequiresEmployee={(v) =>
                    updatePhaseRequiresEmployee(phase.id, v)
                  }
                  onAddResource={(r) => addPhaseResource(phase.id, r)}
                  onRemoveResource={(rId) => removePhaseResource(phase.id, rId)}
                  onRemove={() => removePhase(phase.id)}
                />
              </div>
            ))}
          </div>
        </div>

        {state.error && (
          <div className="p-md bg-red-50 border border-red-200 rounded-md">
            <p className="text-sm text-red-700">{state.error}</p>
          </div>
        )}

        <FormActions
          onCancel={onCancel}
          onSave={handleSave}
          saveLabel={state.isSaving ? "Speichern..." : saveLabel || "Speichern"}
          cancelLabel="Abbrechen"
          isSaving={state.isSaving}
        />
      </div>
    </div>
  );
}
