"use client";

import { Plus } from "lucide-react";

interface AddSectionButtonProps {
  onClick: () => void;
}

export function AddSectionButton({ onClick }: AddSectionButtonProps) {
  return (
    <div className="flex justify-center py-sm">
      <button
        data-testid="add-section-button"
        onClick={onClick}
        className="flex items-center gap-sm p-sm bg-transparent hover:bg-primary/10 border border-dashed border-fg-normal/30 hover:border-primary rounded transition-all group cursor-pointer"
        aria-label="Abschnitt hinzufügen"
      >
        <Plus className="w-lg h-lg text-fg-normal group-hover:text-primary transition-all lg:w-md lg:h-md lg:group-hover:w-lg lg:group-hover:h-lg" />
        <span className="text-xs font-normal text-fg-normal group-hover:text-primary transition-all lg:font-unfocus lg:group-hover:font-focus lg:group-hover:text-sm">
          Abschnitt hinzufügen
        </span>
      </button>
    </div>
  );
}
