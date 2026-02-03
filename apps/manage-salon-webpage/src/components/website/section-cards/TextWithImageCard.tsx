import { TextWithImageSettings } from "@/lib/types/section-types";
import { ImageIcon } from "lucide-react";
import SectionHeader from "./SectionHeader";

interface TextWithImageCardProps {
  settings: TextWithImageSettings;
  order: number;
  menuTitle: string | undefined;
}

export default function TextWithImageCard({
  settings,
  order,
  menuTitle,
}: TextWithImageCardProps) {
  const hasImage = settings.imageUrl && settings.imageUrl.trim() !== "";

  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <SectionHeader
        order={order}
        title="Text mit Bild"
        menuTitle={menuTitle}
      />

      <div className="grid md:grid-cols-2 gap-md">
        <div className="aspect-video bg-bg-2 rounded-md flex items-center justify-center overflow-hidden">
          {hasImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={settings.imageUrl}
              alt={settings.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-sm text-fg-muted">
              <ImageIcon className="w-lg h-lg" />
              <span className="text-sm">Kein Bild</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-normal text-fg-normal text-lg">
            {settings.title || "Kein Titel"}
          </h4>
          <p className="font-unfocus text-fg-normal text-base line-clamp-3">
            {settings.text || "Kein Text"}
          </p>
        </div>
      </div>
    </div>
  );
}
