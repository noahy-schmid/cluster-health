"use client";

import { SectionType } from "@/lib/types/section-types";
import { LucideIcon, ImageIcon, Images } from "lucide-react";
import SectionTypeSelectionButton from "./TypeSelectionButton";
import { Suspense } from "react";

export type SectionTypeInfo = {
  type: SectionType;
  label: string;
  description: string;
  //icon: LucideIcon;
};

const sectionTypes: SectionTypeInfo[] = [
  {
    type: "text-with-image" as SectionType,
    label: "Text mit Bild",
    description: "Textinhalt zusammen mit einem Bild anzeigen",
    //icon: ImageIcon,
  },
  {
    type: "gallery" as SectionType,
    label: "Galerie",
    description: "Mehrere Bilder in einem Galerie-Layout anzeigen",
    //icon: Images,
  },
];

export default function SectionTypeSelection() {
  return (
    <Suspense>
      {sectionTypes.map((sectionType) => (
        <SectionTypeSelectionButton key={sectionType.type} info={sectionType} />
      ))}
    </Suspense>
  );
}
