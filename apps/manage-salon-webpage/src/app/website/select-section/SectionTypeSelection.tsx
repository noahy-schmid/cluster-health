"use client";

import { SectionType } from "@repo/website-database";
import SectionTypeSelectionButton from "./TypeSelectionButton";
import { Suspense } from "react";
import { ImageIcon, Images, List, LucideIcon } from "lucide-react";

export type SectionTypeInfo = {
  type: SectionType;
  label: string;
  description: string;
  icon: LucideIcon;
};

const sectionTypes: SectionTypeInfo[] = [
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
  {
    type: "reason" as SectionType,
    label: "Gründe",
    description: "Zeigen Sie 2-4 Gründe in einem Grid-Layout an",
    icon: List,
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
