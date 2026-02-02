import { TextWithImageSettings } from "@/lib/types/section-types";
import { ImageIcon } from "lucide-react";

interface TextWithImageCardProps {
  settings: TextWithImageSettings;
  order: number;
}

export default function TextWithImageCard({
  settings,
  order,
}: TextWithImageCardProps) {
  const hasImage = settings.imageUrl && settings.imageUrl.trim() !== "";

  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-md">
        <div className="flex items-center gap-md">
          <div className="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-600 font-medium">
            {order}
          </div>
          <div>
            <h3 className="text-lg font-focus text-fg-strong">Text mit Bild</h3>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-md">
        <div className="aspect-video bg-bg-2 rounded-md flex items-center justify-center overflow-hidden">
          {hasImage ? (
            <img
              src={settings.imageUrl}
              alt={settings.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-sm text-fg-muted">
              <ImageIcon className="w-8 h-8" />
              <span className="text-sm">Kein Bild</span>
            </div>
          )}
        </div>
        <div className="flex flex-col gap-sm">
          <h4 className="font-medium text-fg-normal">
            {settings.title || "Kein Titel"}
          </h4>
          <p className="text-sm text-fg-muted line-clamp-3">
            {settings.text || "Kein Text"}
          </p>
        </div>
      </div>
    </div>
  );
}
