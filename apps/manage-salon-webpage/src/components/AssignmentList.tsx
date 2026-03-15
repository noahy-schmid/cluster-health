"use client";

import { useState, useEffect } from "react";
import { Plus, Users } from "lucide-react";
import { useNotifications } from "@/components/notifications/useNotifications";
import FlatChip from "@/components/buttons/FlatChip";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";

interface AssignmentItem {
  id: string;
  name: string;
}

interface AssignmentListProps<T> {
  /** The currently assigned items */
  assignments: T[];
  /** All available items that can be assigned */
  availableItems: AssignmentItem[];
  /** Label for the entity being assigned (e.g. "Stylist" or "Dienstleistung") */
  entityLabel: string;
  /** Extract the display name from an assignment */
  getAssignmentName: (a: T) => string;
  /** Extract the unique key for the assigned entity */
  getAssignmentKey: (a: T) => string;
  /** Called when user assigns a new item */
  onAssign: (itemId: string) => Promise<void>;
  /** Called when user unassigns an item */
  onUnassign: (itemId: string) => Promise<void>;
}

export default function AssignmentList<T>({
  assignments,
  availableItems,
  entityLabel,
  getAssignmentName,
  getAssignmentKey,
  onAssign,
  onUnassign,
}: AssignmentListProps<T>) {
  const { showNotification } = useNotifications();
  const [localAssignments, setLocalAssignments] = useState<T[]>(assignments);

  useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  const assignedKeys = new Set(localAssignments.map(getAssignmentKey));
  const unassignedItems = availableItems.filter(
    (item) => !assignedKeys.has(item.id),
  );

  const handleAssign = async (itemId: string) => {
    try {
      await onAssign(itemId);
      showNotification(`${entityLabel} zugewiesen`, "info", "short");
    } catch {
      showNotification(`Fehler beim Zuweisen: ${entityLabel}`, "error", "long");
    }
  };

  const handleUnassign = async (itemId: string) => {
    try {
      await onUnassign(itemId);
      showNotification(`${entityLabel} entfernt`, "info", "short");
    } catch {
      showNotification(
        `Fehler beim Entfernen: ${entityLabel}`,
        "error",
        "long",
      );
    }
  };

  return (
    <>
      <div className="flex items-center gap-sm mb-md">
        <Users className="w-icon-base h-icon-base text-fg-muted" />
        <h3 className="text-lg font-focus text-fg-strong">
          Zugewiesene {entityLabel}
        </h3>
      </div>
      <div className="bg-bg-1 rounded-lg p-lg border border-border">
        {localAssignments.length === 0 ? (
          <p className="text-sm text-fg-muted pb-md">
            Keine {entityLabel} zugewiesen.
          </p>
        ) : (
          <div className="flex flex-wrap gap-sm mb-md">
            {localAssignments.map((assignment) => {
              const key = getAssignmentKey(assignment);
              return (
                <FlatChip
                  key={key}
                  label={getAssignmentName(assignment)}
                  onDelete={() => handleUnassign(key)}
                />
              );
            })}
          </div>
        )}

        {unassignedItems.length > 0 && (
          <div>
            <p className="text-sm text-fg-muted mb-sm">
              {entityLabel} zuweisen:
            </p>
            <div className="flex flex-wrap gap-sm">
              {unassignedItems.map((item) => (
                <FlatIconTextButton
                  key={item.id}
                  icon={Plus}
                  text={item.name}
                  onClick={() => handleAssign(item.id)}
                  elevation={1}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
