"use client";

import { GripVertical, XIcon, Plus } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ServicePhase, Resource } from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormNumber from "@/components/website/forms/FormNumber";
import FlatIconButton from "@/components/buttons/FlatIconButton";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import FlatChip from "@/components/buttons/FlatChip";

interface PhaseEditorProps {
  phase: ServicePhase;
  index: number;
  availableResources: Resource[];
  onUpdate: (phase: ServicePhase) => void;
  onRemove: () => void;
  onBlur?: (phase: ServicePhase) => void;
}

export default function PhaseEditor({
  phase,
  index,
  availableResources,
  onUpdate,
  onRemove,
  onBlur,
}: PhaseEditorProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: phase.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  // Build combined resource list: employee toggle + other assigned resources
  const isEmployeeAssigned = phase.employeeRequired;

  const assignedResourceSlugs = phase.requiredResourceSlugs;

  const assignedResources = assignedResourceSlugs
    .map((slug) => availableResources.find((r) => r.slug === slug))
    .filter(Boolean) as Resource[];

  const unassignedResources = availableResources.filter(
    (r) => !assignedResourceSlugs.includes(r.slug),
  );

  const emitUpdate = (updates: Partial<ServicePhase>) => {
    onUpdate({ ...phase, ...updates });
  };

  const emitCompletedUpdate = (updates: Partial<ServicePhase>) => {
    const nextPhase = { ...phase, ...updates };
    onUpdate(nextPhase);
    onBlur?.(nextPhase);
  };

  const handleToggleEmployee = () => {
    emitCompletedUpdate({ employeeRequired: !phase.employeeRequired });
  };

  const handleAddResource = (resource: Resource) => {
    if (phase.requiredResourceSlugs.includes(resource.slug)) {
      return;
    }

    emitCompletedUpdate({
      requiredResourceSlugs: [...phase.requiredResourceSlugs, resource.slug],
    });
  };

  const handleRemoveResource = (slug: string) => {
    emitCompletedUpdate({
      requiredResourceSlugs: phase.requiredResourceSlugs.filter(
        (s) => s !== slug,
      ),
    });
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-sm">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-bg-1 rounded transition-colors touch-none mt-md lg:bg-transparent bg-bg-1"
          aria-label="Phase verschieben"
        >
          <GripVertical className="w-icon-base h-icon-base lg:text-fg-muted text-fg-normal" />
        </button>

        {/* Phase Content */}
        <div className="flex-1 min-w-0 bg-bg-1 border border-border rounded-lg p-md">
          <div className="flex items-center gap-sm mb-md">
            <span className="text-sm font-focus text-fg-muted flex-shrink-0">
              Phase {index + 1}
            </span>
            <div className="flex-1" />
            <FlatIconButton
              icon={XIcon}
              onClick={onRemove}
              elevation={1}
              ariaLabel="Phase entfernen"
              isError
            />
          </div>

          <div className="space-y-md">
            <FormInput
              label="Name"
              value={phase.name}
              onChange={(name) => emitUpdate({ name })}
              onBlur={onBlur ? () => onBlur(phase) : undefined}
              placeholder="z.B. Haare waschen"
            />

            <FormNumber
              label="Dauer (Minuten)"
              value={phase.durationMinutes}
              onChange={(durationMinutes) => emitUpdate({ durationMinutes })}
              onBlur={onBlur ? () => onBlur(phase) : undefined}
              min={1}
              max={480}
            />

            <div className="flex flex-col gap-sm">
              <label className="text-sm font-normal text-fg-strong">
                Benötigte Ausstattung
              </label>
              <div className="flex flex-wrap gap-sm">
                {/* Employee resource as chip */}
                {isEmployeeAssigned && (
                  <FlatChip
                    label="Mitarbeiter"
                    onDelete={handleToggleEmployee}
                  />
                )}
                {/* Other assigned resources */}
                {assignedResources.map((r) => (
                  <FlatChip
                    key={r.slug}
                    label={r.name}
                    onDelete={() => handleRemoveResource(r.slug)}
                  />
                ))}
              </div>

              {/* Unassigned resources (+ employee if not assigned) */}
              {(unassignedResources.length > 0 || !isEmployeeAssigned) && (
                <div className="flex flex-wrap gap-sm mt-sm">
                  {!isEmployeeAssigned && (
                    <FlatIconTextButton
                      icon={Plus}
                      text="Mitarbeiter"
                      onClick={handleToggleEmployee}
                      elevation={1}
                    />
                  )}
                  {unassignedResources.map((resource) => (
                    <FlatIconTextButton
                      key={resource.slug}
                      icon={Plus}
                      text={resource.name}
                      onClick={() => handleAddResource(resource)}
                      elevation={1}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
