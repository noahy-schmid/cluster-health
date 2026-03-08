"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getColorSettings } from "@/api/website-actions";
import ColorsEditorClient from "@/components/website/ColorsEditorClient";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";
import { ColorSettings } from "@/api/website-actions";
import PageHeader from "@/components/PageHeader";

export const dynamic = "force-dynamic";

export default function ColorsPage() {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();
  const [colors, setColors] = useState<ColorSettings | undefined>(undefined);

  useEffect(() => {
    const loadColors = async () => {
      if (!websiteId) return;

      const result = await getColorSettings(websiteId);

      if (!result.success) {
        router.replace(`/salon/${salonId}`);
        return;
      }

      setColors(result.colors);
    };

    loadColors();
  }, [router, salonId, websiteId]);

  if (!colors) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Farbschema" subtitle="Lade Farben..." />
      </div>
    );
  }

  return <ColorsEditorClient initialColors={colors} />;
}
