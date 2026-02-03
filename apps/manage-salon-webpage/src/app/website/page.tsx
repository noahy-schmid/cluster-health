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

export default function WebseitePage() {
  const router = useRouter();

  // Get state and actions from Zustand store
  const sections = useSectionsStore((state) => state.sections);
  const isLoading = useSectionsStore((state) => state.isLoading);
  const initializeSections = useSectionsStore((state) => state.initialize);
  const initializeWebsite = useWebsiteStore((state) => state.initialize);
  const removeSection = useSectionsStore((state) => state.removeSection);
  const reorderSections = useSectionsStore((state) => state.reorderSections);

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

  // Show loading state
  if (isLoading) {
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
      />

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
