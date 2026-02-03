"use client";

import { Section } from "@/lib/types/section-types";
import { GripVertical, Trash2, Settings } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TextWithImageCard from "./TextWithImageCard";
import GalleryCard from "./GalleryCard";

interface SectionCardProps {
  section: Section;
  onDelete: (id: string) => void;
  onSettings: (id: string) => void;
}

export function SectionCard({
  section,
  onDelete,
  onSettings,
}: SectionCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: section.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative ${isDragging ? "opacity-50" : ""}`}
    >
      <div className="flex items-start gap-sm lg:gap-md">
        {/* Drag Handle */}
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-bg-1 rounded transition-colors touch-none mt-md"
          aria-label="Abschnitt verschieben"
        >
          <GripVertical className="w-5 h-5 text-fg-muted" />
        </button>

        {/* Section Content */}
        <div className="flex-1 min-w-0">{renderSectionContent(section)}</div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-2 mt-md">
          <button
            onClick={() => onSettings(section.id)}
            className="p-2 hover:bg-bg-1 rounded group"
            aria-label="Edit section"
          >
            <Settings className="w-5 h-5 text-fg-muted group-hover:text-fg-normal" />
          </button>
          <button
            onClick={() => onDelete(section.id)}
            className="p-2 hover:bg-bg-1 rounded group"
            aria-label="Delete section"
          >
            <Trash2 className="w-5 h-5 text-fg-muted group-hover:text-red-600" />
          </button>
        </div>
      </div>
    </div>
  );
}

function renderSectionContent(section: Section) {
  switch (section.type) {
    case "text-with-image":
      return (
        <TextWithImageCard
          settings={section.settings}
          order={section.order}
          menuTitle={section.menuTitle}
        />
      );

    case "gallery":
      return (
        <GalleryCard
          settings={section.settings}
          order={section.order}
          menuTitle={section.menuTitle}
        />
      );

    default:
      return (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-lg">
          <div className="text-near-black">
            <h3 className="font-semibold mb-sm">Unknown Section Type</h3>
            <p className="text-sm text-gray-600">
              This section type is not configured
            </p>
          </div>
        </div>
      );
  }
}
