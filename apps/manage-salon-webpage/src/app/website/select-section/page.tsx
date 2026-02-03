"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ImageIcon, Images, StepBack } from "lucide-react";
import { SectionType } from "@/lib/types/section-types";
import { useSectionsStore } from "@/services/sections-store";
import PageHeader from "@/components/PageHeader";

const sectionTypes = [
  {
    type: "text-with-image" as SectionType,
    label: "Text mit Bild",
    description: "Textinhalt zusammen mit einem Bild anzeigen",
    icon: ImageIcon,
  },
  {
    type: "gallery" as SectionType,
    label: "Galerie",
    description: "Mehrere Bilder in einem Galerie-Layout anzeigen",
    icon: Images,
  },
];

export default function SelectSectionPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const position = searchParams.get("position") || "0";
  const createSection = useSectionsStore((state) => state.createSection);

  const handleSelectType = async (type: SectionType) => {
    // Create the section directly using the store
    const section = await createSection(type, parseInt(position, 10));

    if (section) {
      // Navigate to settings page for the newly created section
      router.replace(`/website`);
    } else {
      // If creation failed, go back to website page
      router.push("/website");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <button
        onClick={() => router.back()}
        className="text-base text-fg-muted hover:text-fg-normal flex items-center gap-2 bg-bg-1 px-4 py-2 rounded-md hover:bg-bg-2 transition-colors cursor-pointer"
      >
        <ChevronLeft className="w-4 h-4" /> Zurück zur Webseite
      </button>

      <PageHeader
        title="Abschnittstyp Wählen"
        subtitle="Wähle die Art des Abschnitts welche hinzugefügt werden soll"
      ></PageHeader>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {sectionTypes.map((sectionType) => {
          const Icon = sectionType.icon;
          return (
            <button
              key={sectionType.type}
              onClick={() => handleSelectType(sectionType.type)}
              className="bg-bg-1 border border-border rounded-lg p-lg hover:bg-bg-2 hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-center gap-md mb-md">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-focus text-fg-strong mb-1">
                    {sectionType.label}
                  </h3>
                </div>
              </div>
              <p className="text-md font-unfocus text-fg-normal leading-relaxed">
                {sectionType.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
