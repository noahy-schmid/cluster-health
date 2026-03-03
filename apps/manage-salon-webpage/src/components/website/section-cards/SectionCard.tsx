"use client";

import { GripVertical, Trash2, Settings } from "lucide-react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import TextWithImageCard from "./TextWithImageCard";
import GalleryCard from "./GalleryCard";
import ReasonCard from "./ReasonCard";
import CenterTextCard from "./CenterTextCard";
import StylistsCard from "./StylistsCard";
import { AllSections } from "@repo/website-domain";
import FlatIconButton from "@/components/buttons/FlatIconButton";

interface SectionCardProps {
  section: AllSections;
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
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-bg-1 rounded transition-colors touch-none mt-md lg:bg-transparent bg-bg-1"
          aria-label="Abschnitt verschieben"
        >
          <GripVertical className="w-icon-base h-icon-base lg:text-fg-muted text-fg-normal" />
        </button>

        {/* Section Content */}
        <div className="flex-1 min-w-0">{renderSectionContent(section)}</div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-2 mt-md">
          <FlatIconButton
            icon={Settings}
            onClick={() => onSettings(section.id)}
            elevation={0}
            ariaLabel="Edit section"
          />
          <FlatIconButton
            icon={Trash2}
            onClick={() => {
              if (confirm("Möchtest du diesen Abschnitt wirklich löschen?")) {
                onDelete(section.id);
              }
            }}
            elevation={0}
            isError
            ariaLabel="Delete section"
          />
        </div>
      </div>
    </div>
  );
}

function renderSectionContent(section: AllSections) {
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

    case "center-text":
      return (
        <CenterTextCard
          settings={section.settings}
          order={section.order}
          menuTitle={section.menuTitle}
        />
      );

    case "reason":
      return (
        <ReasonCard
          settings={section.settings}
          order={section.order}
          menuTitle={section.menuTitle}
        />
      );

    case "stylists-section":
      return (
        <StylistsCard
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
