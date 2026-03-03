"use client";

import { useState, useEffect } from "react";
import { Plus, XIcon, Users } from "lucide-react";
import type { StylistServiceAssignment } from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface AssignmentItem {
  id: string;
  name: string;
}

interface AssignmentListProps {
  /** The currently assigned items */
  assignments: StylistServiceAssignment[];
  /** All available items that can be assigned */
  availableItems: AssignmentItem[];
  /** Label for the entity being assigned (e.g. "Stylist" or "Dienstleistung") */
  entityLabel: string;
  /** Extract the display name from an assignment */
  getAssignmentName: (a: StylistServiceAssignment) => string;
  /** Extract the unique key for the assigned entity */
  getAssignmentKey: (a: StylistServiceAssignment) => string;
  /** Called when user assigns a new item */
  onAssign: (itemId: string) => Promise<void>;
  /** Called when user unassigns an item */
  onUnassign: (itemId: string) => Promise<void>;
}

export default function AssignmentList({
  assignments,
  availableItems,
  entityLabel,
  getAssignmentName,
  getAssignmentKey,
  onAssign,
  onUnassign,
}: AssignmentListProps) {
  const { showNotification } = useNotifications();
  const [localAssignments, setLocalAssignments] =
    useState<StylistServiceAssignment[]>(assignments);
  const [isAssigning, setIsAssigning] = useState(false);

  useEffect(() => {
    setLocalAssignments(assignments);
  }, [assignments]);

  const assignedKeys = new Set(localAssignments.map(getAssignmentKey));
  const unassignedItems = availableItems.filter(
    (item) => !assignedKeys.has(item.id),
  );

  const handleAssign = async (itemId: string) => {
    setIsAssigning(true);
    try {
      await onAssign(itemId);
    } catch {
      showNotification(`Fehler beim Zuweisen: ${entityLabel}`, "error", "long");
    } finally {
      setIsAssigning(false);
    }
  };

  const handleUnassign = async (itemId: string) => {
    try {
      await onUnassign(itemId);
    } catch {
      showNotification(
        `Fehler beim Entfernen: ${entityLabel}`,
        "error",
        "long",
      );
    }
  };

  return (
    <div className="bg-bg-1 rounded-lg p-lg">
      <div className="flex items-center gap-sm mb-md">
        <Users className="w-5 h-5 text-fg-muted" />
        <h3 className="text-base font-focus text-fg-strong">
          Zugewiesene {entityLabel}
        </h3>
      </div>

      {localAssignments.length === 0 ? (
        <p className="text-sm text-fg-muted py-md">
          Keine {entityLabel} zugewiesen.
        </p>
      ) : (
        <div className="flex flex-wrap gap-sm mb-md">
          {localAssignments.map((assignment) => {
            const key = getAssignmentKey(assignment);
            return (
              <span
                key={key}
                className="flex items-center gap-sm bg-primary-100 text-primary-800 px-md py-sm rounded-md text-sm"
              >
                {getAssignmentName(assignment)}
                <button
                  onClick={() => handleUnassign(key)}
                  className="cursor-pointer hover:text-fg-error"
                  aria-label={`${getAssignmentName(assignment)} entfernen`}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </span>
            );
          })}
        </div>
      )}

      {unassignedItems.length > 0 && (
        <div>
          <p className="text-sm text-fg-muted mb-sm">{entityLabel} zuweisen:</p>
          <div className="flex flex-wrap gap-sm">
            {unassignedItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleAssign(item.id)}
                disabled={isAssigning}
                className="flex items-center gap-1 px-sm py-1 rounded-md border border-border text-sm text-fg-muted hover:bg-bg-2 hover:text-fg-normal cursor-pointer disabled:opacity-50"
              >
                <Plus className="w-3 h-3" />
                {item.name}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
