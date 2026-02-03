"use client";

import { Plus } from "lucide-react";

interface EmptySectionPlaceholderProps {
  onAddSection: () => void;
}

export function EmptySectionPlaceholder({
  onAddSection,
}: EmptySectionPlaceholderProps) {
  return (
    <button
      onClick={onAddSection}
      className="w-full min-h-[300px] border-2 border-dashed border-border rounded-lg flex flex-col items-center justify-center gap-md hover:border-primary hover:bg-bg-1 transition-colors cursor-pointer group"
    >
      <div className="w-16 h-16 rounded-full border-2 border-dashed border-border group-hover:border-primary flex items-center justify-center transition-colors">
        <Plus className="w-8 h-8 text-text-muted group-hover:text-primary transition-colors" />
      </div>
      <div className="text-center">
        <p className="text-base font-medium text-text-primary">
          Keine Abschnitte vorhanden
        </p>
        <p className="text-sm text-text-muted mt-1">
          Klicken Sie hier, um Ihren ersten Abschnitt zu erstellen
        </p>
      </div>
    </button>
  );
}
