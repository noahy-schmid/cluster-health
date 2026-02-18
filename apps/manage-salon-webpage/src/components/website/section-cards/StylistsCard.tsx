"use client";

import { Users } from "lucide-react";
import { useRouter } from "next/navigation";
import SectionHeader from "./SectionHeader";
import { StylistsSettings } from "@repo/website-database";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import FlatIconTextButton from "@/components/FlatIconTextButton";

interface StylistsCardProps {
  settings: StylistsSettings;
  order: number;
  menuTitle: string | undefined;
}

export default function StylistsCard({
  settings,
  order,
  menuTitle,
}: StylistsCardProps) {
  const router = useRouter();
  const { salonId } = useWebsiteRouteContext();

  const handleManageStylists = () => {
    router.push(`/salon/${salonId}/stylists`);
  };

  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <SectionHeader
        order={order}
        title="Team Abschnitt"
        menuTitle={menuTitle}
      />

      <div className="space-y-sm">
        <h4 className="font-normal text-fg-normal text-lg">
          {settings.title || "Kein Titel"}
        </h4>
        <h6 className="font-unfocus text-fg-normal text-base">
          {settings.subtitle || "Kein Untertitel"}
        </h6>

        <div className="pt-md mt-md border-t border-border">
          <p className="text-sm text-fg-muted mb-md">
            Die Stylisten werden auf der Seite für Stylisten verwaltet.
          </p>

          <FlatIconTextButton
            icon={Users}
            text="Stylisten verwalten"
            onClick={handleManageStylists}
            elevation={1}
          />
        </div>
      </div>
    </div>
  );
}
