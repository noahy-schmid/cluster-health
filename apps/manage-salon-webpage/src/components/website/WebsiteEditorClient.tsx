"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { SectionCard } from "@/components/website/section-cards/SectionCard";
import { AddSectionButton } from "@/components/website/AddSectionButton";
import PageHeader from "@/components/PageHeader";
import { ExternalLink, Palette, Settings } from "lucide-react";
import HeroCard from "@/components/website/section-cards/HeroCard";
import { AllSections, HeroSettings } from "@repo/website-database";
import {
  deleteSection as deleteSectionAction,
  reorderSections as reorderSectionsAction,
} from "@/api/sections-actions";
import { openWebsite } from "@/api/website-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";

interface WebsiteEditorClientProps {
  initialSections: AllSections[];
  heroSettings: HeroSettings;
}

export default function WebsiteEditorClient({
  initialSections,
  heroSettings,
}: WebsiteEditorClientProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [sections, setSections] = useState<AllSections[]>(initialSections);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const sectionIds = useMemo(
    () => sections.map((section) => section.id),
    [sections],
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!over || active.id === over.id) return;

    const oldIndex = sections.findIndex((item) => item.id === active.id);
    const newIndex = sections.findIndex((item) => item.id === over.id);

    if (oldIndex === -1 || newIndex === -1) return;

    const nextSections = [...sections];
    const [movedSection] = nextSections.splice(oldIndex, 1);
    nextSections.splice(newIndex, 0, movedSection);
    setSections(nextSections);

    const result = await reorderSectionsAction(
      websiteId ?? "",
      nextSections.map((section) => section.id),
    );

    if (!result.success) {
      setSections(sections);
    }
  };

  const handleAddSection = (position?: number) => {
    router.push(
      `/salon/${salonId}/website/${websiteId}/select-section?position=${
        position ?? sections.length
      }`,
    );
  };

  const handleDeleteSection = async (id: string) => {
    const nextSections = sections.filter((section) => section.id !== id);
    setSections(nextSections);

    const result = await deleteSectionAction(websiteId ?? "", id);
    if (!result.success) {
      setSections(sections);
    }
  };

  const handleSectionSettings = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      router.push(
        `/salon/${salonId}/website/${websiteId}/${id}/${section.type}`,
      );
    }
  };

  const handleHeroSettings = () => {
    router.push(`/salon/${salonId}/website/${websiteId}/start/hero`);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Webseite bearbeiten"
        subtitle="Erstellen und verwalten Sie die Abschnitte Ihrer Salon-Webseite"
        actions={[
          {
            icon: Settings,
            text: "Einstellungen",
            onClick: () =>
              router.push(`/salon/${salonId}/website/${websiteId}/settings`),
          },
          {
            icon: Palette,
            text: "Farbschema anpassen",
            onClick: () =>
              router.push(`/salon/${salonId}/website/${websiteId}/colors`),
          },
          {
            icon: ExternalLink,
            text: "Öffnen",
            onClick: async () => {
              const result = await openWebsite(websiteId ?? "");
              if (result.success) {
                window.open(result.url, "_blank");
              } else {
                console.error("Failed to open website:", result.error);
              }
            },
          },
        ]}
      />
      <div className="flex items-start gap-sm lg:gap-md mb-lg">
        {/* Drag Handle */}
        <button
          className="cursor-grab active:cursor-grabbing p-2 hover:bg-bg-1 rounded transition-colors touch-none mt-md"
          aria-label="Abschnitt verschieben"
        >
          <div className="w-5 h-5 invisible"></div>
        </button>

        {/* Section Content */}
        <div className="flex-1 min-w-0">
          <HeroCard settings={heroSettings} />
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-2 mt-md">
          <button
            onClick={handleHeroSettings}
            className="p-2 hover:bg-bg-1 rounded group"
            aria-label="Edit section"
          >
            <Settings className="w-5 h-5 text-fg-muted group-hover:text-fg-normal" />
          </button>
        </div>
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={sectionIds}
          strategy={verticalListSortingStrategy}
        >
          <div>
            <AddSectionButton onClick={() => handleAddSection(0)} />
            {sections.map((section, index) => (
              <div key={section.id}>
                <SectionCard
                  section={section}
                  onDelete={handleDeleteSection}
                  onSettings={handleSectionSettings}
                />
                <AddSectionButton onClick={() => handleAddSection(index + 1)} />
              </div>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
