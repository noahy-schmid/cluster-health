"use client";

import type { LucideIcon } from "lucide-react";

export interface TypeSelectionOption<T extends string> {
  type: T;
  label: string;
  description: string;
  icon: LucideIcon;
}

interface TypeSelectionPanelProps<T extends string> {
  options: TypeSelectionOption<T>[];
  onSelect: (type: T) => void;
}

export default function TypeSelectionPanel<T extends string>({
  options,
  onSelect,
}: TypeSelectionPanelProps<T>) {
  return (
    <>
      {options.map((option) => {
        const Icon = option.icon;
        return (
          <button
            key={option.type}
            onClick={() => onSelect(option.type)}
            className="bg-bg-1 border border-border rounded-lg p-lg hover:bg-bg-2 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center gap-md mb-md">
              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-focus text-fg-strong mb-1">
                  {option.label}
                </h3>
              </div>
            </div>
            <p className="text-md font-unfocus text-fg-normal leading-relaxed">
              {option.description}
            </p>
          </button>
        );
      })}
    </>
  );
}
