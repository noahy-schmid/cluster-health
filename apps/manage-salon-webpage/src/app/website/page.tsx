"use client";

import { useEffect } from "react";
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
import { useSectionsStore } from "@/services/sections-store";
import { EmptySectionPlaceholder } from "@/components/website/EmptySectionPlaceholder";
import { SectionCard } from "@/components/website/section-cards/SectionCard";
import { AddSectionButton } from "@/components/website/AddSectionButton";
import PageHeader from "@/components/PageHeader";
import { useWebsiteStore } from "@/services/website-store";
import { Palette, Settings } from "lucide-react";
import HeroCard from "@/components/website/section-cards/HeroCard";

export default function WebseitePage() {
  const router = useRouter();

  // Get state and actions from Zustand store
  const sections = useSectionsStore((state) => state.sections);
  const sectionsStatus = useSectionsStore((state) => state.status);
  const initializeSections = useSectionsStore((state) => state.initialize);
  const initializeWebsite = useWebsiteStore((state) => state.initialize);
  const removeSection = useSectionsStore((state) => state.removeSection);
  const reorderSections = useSectionsStore((state) => state.reorderSections);
  const heroSettings = useWebsiteStore((state) => state.heroSettings);

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

  // Initialize store on mount
  useEffect(() => {
    initializeWebsite().then(() => {
      initializeSections();
    });
  }, [initializeWebsite, initializeSections]);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = sections.findIndex((item) => item.id === active.id);
      const newIndex = sections.findIndex((item) => item.id === over.id);

      reorderSections(oldIndex, newIndex);
    }
  };

  const handleAddSection = (position?: number) => {
    router.push(
      `/website/select-section?position=${position ?? sections.length}`,
    );
  };

  const handleDeleteSection = (id: string) => {
    removeSection(id);
  };

  const handleSectionSettings = (id: string) => {
    const section = sections.find((s) => s.id === id);
    if (section) {
      router.push(`/website/${id}/${section.type}`);
    }
  };

  const handleHeroSettings = () => {
    router.push("/website/start/hero");
  };

  // Show loading state
  if (sectionsStatus !== "initialized") {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Webseite bearbeiten" subtitle="Lade Abschnitte..." />
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Webseite bearbeiten"
          subtitle="Erstellen und verwalten Sie die Abschnitte Ihrer Salon-Webseite"
        />

        <EmptySectionPlaceholder onAddSection={() => handleAddSection()} />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Webseite bearbeiten"
        subtitle="Erstellen und verwalten Sie die Abschnitte Ihrer Salon-Webseite"
        actions={[
          {
            icon: Palette,
            text: "Farbschema anpassen",
            onClick: () => router.push("/website/colors"),
          },
          {
            icon: Settings,
            text: "Einstellungen",
            onClick: () => {},
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
          items={sections}
          strategy={verticalListSortingStrategy}
        >
          <div>
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
