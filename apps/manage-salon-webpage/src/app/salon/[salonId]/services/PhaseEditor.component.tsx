"use client";

import { XIcon, Plus, GripVertical } from "lucide-react";
import type { ServicePhase, SalonResource } from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormToggle from "@/components/website/forms/FormToggle";
import FlatIconButton from "@/components/buttons/FlatIconButton";

interface PhaseEditorProps {
  phase: ServicePhase;
  index: number;
  availableResources: SalonResource[];
  onUpdateName: (name: string) => void;
  onUpdateDuration: (durationMinutes: number) => void;
  onUpdateRequiresEmployee: (requiresEmployee: boolean) => void;
  onAddResource: (resource: SalonResource) => void;
  onRemoveResource: (resourceId: string) => void;
  onRemove: () => void;
}

export default function PhaseEditor({
  phase,
  index,
  availableResources,
  onUpdateName,
  onUpdateDuration,
  onUpdateRequiresEmployee,
  onAddResource,
  onRemoveResource,
  onRemove,
}: PhaseEditorProps) {
  const unassignedResources = availableResources.filter(
    (r) => !phase.requiredResources.some((pr) => pr.resourceId === r.id),
  );

  return (
    <div className="bg-bg-0 border border-border rounded-lg p-md">
      <div className="flex items-center gap-sm mb-md">
        <GripVertical className="w-5 h-5 text-fg-muted cursor-grab flex-shrink-0" />
        <span className="text-sm font-focus text-fg-muted flex-shrink-0">
          Phase {index + 1}
        </span>
        <div className="flex-1" />
        <FlatIconButton
          icon={XIcon}
          onClick={onRemove}
          elevation={0}
          ariaLabel="Phase entfernen"
          isError
        />
      </div>

      <div className="space-y-md">
        <FormInput
          label="Name"
          value={phase.name}
          onChange={onUpdateName}
          placeholder="z.B. Haare waschen"
        />

        <div className="flex flex-col gap-sm">
          <label className="text-sm font-normal text-fg-strong">
            Dauer (Minuten)
          </label>
          <input
            type="number"
            min={1}
            max={480}
            value={phase.durationMinutes}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              if (!isNaN(val) && val > 0) onUpdateDuration(val);
            }}
            className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal w-32"
          />
        </div>

        <FormToggle
          label="Mitarbeiter benötigt"
          value={phase.requiresEmployee}
          onChange={onUpdateRequiresEmployee}
          onLabel="Ja"
          offLabel="Nein"
          helperText="Ist der Stylist während dieser Phase beschäftigt?"
        />

        <div className="flex flex-col gap-sm">
          <label className="text-sm font-normal text-fg-strong">
            Benötigte Ressourcen
          </label>
          <div className="flex flex-wrap gap-sm">
            {phase.requiredResources.map((r) => (
              <span
                key={r.resourceId}
                className="flex items-center gap-sm bg-primary-100 text-primary-800 px-sm py-1 rounded-md text-sm"
              >
                {r.resourceName}
                <button
                  onClick={() => onRemoveResource(r.resourceId)}
                  className="cursor-pointer hover:text-fg-error"
                  aria-label={`${r.resourceName} entfernen`}
                >
                  <XIcon className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
          {unassignedResources.length > 0 && (
            <div className="flex flex-wrap gap-sm mt-sm">
              {unassignedResources.map((resource) => (
                <button
                  key={resource.id}
                  onClick={() => onAddResource(resource)}
                  className="flex items-center gap-1 px-sm py-1 rounded-md border border-border text-sm text-fg-muted hover:bg-bg-1 hover:text-fg-normal cursor-pointer"
                >
                  <Plus className="w-3 h-3" />
                  {resource.name}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
