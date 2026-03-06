"use client";

import { GripVertical, XIcon, Plus } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { ServicePhase, SalonResource } from "@/lib/types/service-types";
import { EMPLOYEE_RESOURCE_ID } from "@/lib/types/service-types";
import FormInput from "@/components/website/forms/FormInput";
import FormNumber from "@/components/website/forms/FormNumber";
import FlatIconButton from "@/components/buttons/FlatIconButton";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import FlatChip from "@/components/buttons/FlatChip";

interface PhaseEditorProps {
  phase: ServicePhase;
  index: number;
  availableResources: SalonResource[];
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

  // Build combined resource list: employee + other assigned resources
  const isEmployeeAssigned = phase.requiresEmployee;
  const employeeResource = availableResources.find(
    (r) => r.id === EMPLOYEE_RESOURCE_ID,
  );

  const assignedNonEmployee = phase.requiredResources.filter(
    (r) => r.resourceId !== EMPLOYEE_RESOURCE_ID,
  );

  const unassignedResources = availableResources.filter(
    (r) =>
      r.id !== EMPLOYEE_RESOURCE_ID &&
      !phase.requiredResources.some((pr) => pr.resourceId === r.id),
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
    emitCompletedUpdate({ requiresEmployee: !phase.requiresEmployee });
  };

  const handleAddResource = (resource: SalonResource) => {
    if (phase.requiredResources.some((r) => r.resourceId === resource.id)) {
      return;
    }

    emitCompletedUpdate({
      requiredResources: [
        ...phase.requiredResources,
        {
          resourceId: resource.id,
          resourceName: resource.name,
        },
      ],
    });
  };

  const handleRemoveResource = (resourceId: string) => {
    emitCompletedUpdate({
      requiredResources: phase.requiredResources.filter(
        (resource) => resource.resourceId !== resourceId,
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
                Benötigte Ressourcen
              </label>
              <div className="flex flex-wrap gap-sm">
                {/* Employee resource as chip */}
                {isEmployeeAssigned && employeeResource && (
                  <FlatChip
                    label={employeeResource.name}
                    onDelete={handleToggleEmployee}
                  />
                )}
                {/* Other assigned resources */}
                {assignedNonEmployee.map((r) => (
                  <FlatChip
                    key={r.resourceId}
                    label={r.resourceName}
                    onDelete={() => handleRemoveResource(r.resourceId)}
                  />
                ))}
              </div>

              {/* Unassigned resources (+ employee if not assigned) */}
              {(unassignedResources.length > 0 || !isEmployeeAssigned) && (
                <div className="flex flex-wrap gap-sm mt-sm">
                  {!isEmployeeAssigned && employeeResource && (
                    <FlatIconTextButton
                      icon={Plus}
                      text={employeeResource.name}
                      onClick={handleToggleEmployee}
                      elevation={1}
                    />
                  )}
                  {unassignedResources.map((resource) => (
                    <FlatIconTextButton
                      key={resource.id}
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
