"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ImageIcon, Images } from "lucide-react";
import { SectionType } from "@/lib/types/section-types";
import { useSectionsStore } from "@/services/sections-store";

const sectionTypes = [
  {
    type: "text-with-image" as SectionType,
    label: "Text with Image",
    description: "Display text content alongside an image",
    icon: ImageIcon,
  },
  {
    type: "gallery" as SectionType,
    label: "Gallery",
    description: "Showcase multiple images in a gallery layout",
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
    <div className="max-w-5xl mx-auto">
      <div className="mb-xl">
        <button
          onClick={() => router.back()}
          className="text-sm text-text-muted hover:text-text-primary mb-lg inline-flex items-center gap-2 transition-colors"
        >
          ← Zurück
        </button>
        <h1 className="text-3xl font-bold text-near-black mb-sm">
          Select Section Type
        </h1>
        <p className="text-base text-gray-600">
          Choose the type of section you want to add
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        {sectionTypes.map((sectionType) => {
          const Icon = sectionType.icon;
          return (
            <button
              key={sectionType.type}
              onClick={() => handleSelectType(sectionType.type)}
              className="bg-bg-2 border border-border rounded-lg p-lg hover:border-primary hover:shadow-md transition-all text-left group"
            >
              <div className="flex items-start gap-md mb-md">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-text-primary mb-1">
                    {sectionType.label}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-text-muted leading-relaxed">
                {sectionType.description}
              </p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
