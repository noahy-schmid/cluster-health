"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";
import { fetchStylists } from "@/api/stylists-actions";
import { Stylist } from "@repo/salon-domain";
import StylistList from "@/components/stylists/StylistList";

interface StylistsPageProps {
  params: Promise<{ salonId: string }>;
}

export default function StylistsPage({ params }: StylistsPageProps) {
  const router = useRouter();
  const [salonId, setSalonId] = useState<string>("");
  const [stylists, setStylists] = useState<Stylist[] | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSalonId(resolvedParams.salonId);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!salonId) return;

    const loadStylists = async () => {
      setIsLoading(true);
      const result = await fetchStylists(salonId);

      if (!result.success) {
        console.error("Failed to load stylists:", result.error);
        setIsLoading(false);
        return;
      }

      setStylists(result.stylists);
      setIsLoading(false);
    };

    loadStylists();
  }, [salonId]);

  const handleAddStylist = () => {
    router.push(`/salon/${salonId}/stylists/create`);
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto">
        <PageHeader title="Stylisten" subtitle="Lade Stylisten..." />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <PageHeader
        title="Stylisten"
        subtitle="Verwalte die Stylisten deines Salons"
        actions={[
          {
            icon: Plus,
            text: "Stylist hinzufügen",
            onClick: handleAddStylist,
          },
        ]}
      />
      <StylistList stylists={stylists || []} salonId={salonId} />
    </div>
  );
}
