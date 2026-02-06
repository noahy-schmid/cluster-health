import SectionHeader from "./SectionHeader";
import { CenterTextSettings } from "@repo/website-database";

interface CenterTextCardProps {
  settings: CenterTextSettings;
  order: number;
  menuTitle: string | undefined;
}

export default function CenterTextCard({
  settings,
  order,
  menuTitle,
}: CenterTextCardProps) {
  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <SectionHeader
        order={order}
        title="Text Abschnitt"
        menuTitle={menuTitle}
      />

      <div className="space-y-sm text-center">
        <h4 className="font-normal text-fg-normal text-lg">
          {settings.title || "Kein Titel"}
        </h4>
        <p className="font-unfocus text-fg-normal text-base line-clamp-3">
          {settings.content || "Kein Text"}
        </p>
      </div>
    </div>
  );
}
