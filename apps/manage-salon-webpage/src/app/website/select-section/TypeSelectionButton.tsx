"use client";

import { useSectionsStore } from "@/services/sections-store";
import { useRouter, useSearchParams } from "next/navigation";
import { SectionTypeInfo } from "./SectionTypeSelection";
import { SectionType } from "@repo/website-database";

export default function SectionTypeSelectionButton({
  info,
}: {
  info: SectionTypeInfo;
}) {
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

  const Icon = info.icon;

  return (
    <button
      onClick={() => handleSelectType(info.type)}
      className="bg-bg-1 border border-border rounded-lg p-lg hover:bg-bg-2 hover:shadow-md transition-all text-left group"
    >
      <div className="flex items-center gap-md mb-md">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
          <Icon className="w-6 h-6 text-primary" />
        </div>
        <div className="flex-1">
          <h3 className="text-lg font-focus text-fg-strong mb-1">
            {info.label}
          </h3>
        </div>
      </div>
      <p className="text-md font-unfocus text-fg-normal leading-relaxed">
        {info.description}
      </p>
    </button>
  );
}
