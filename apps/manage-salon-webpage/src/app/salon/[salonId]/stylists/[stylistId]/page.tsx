"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StylistForm, {
  StylistFormData,
} from "@/components/stylists/StylistForm";
import BackButton from "@/components/BackButton";
import { fetchStylist, updateStylist } from "@/api/stylists-actions";
import { Stylist } from "@repo/salon-domain";

interface EditStylistPageProps {
  params: Promise<{ salonId: string; stylistId: string }>;
}

export default function EditStylistPage({ params }: EditStylistPageProps) {
  const router = useRouter();
  const [salonId, setSalonId] = useState<string>("");
  const [stylistId, setStylistId] = useState<string>("");
  const [stylist, setStylist] = useState<Stylist | undefined>(undefined);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSalonId(resolvedParams.salonId);
      setStylistId(resolvedParams.stylistId);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!salonId || !stylistId) return;

    const loadStylist = async () => {
      setIsLoading(true);
      const result = await fetchStylist(salonId, stylistId);

      if (!result.success) {
        console.error("Failed to load stylist:", result.error);
        router.push(`/salon/${salonId}/stylists`);
        return;
      }

      setStylist(result.stylist);
      setIsLoading(false);
    };

    loadStylist();
  }, [salonId, stylistId, router]);

  const handleSubmit = async (data: StylistFormData) => {
    if (!stylist) return;

    const result = await updateStylist(salonId, stylist.id, data);

    if (!result.success) {
      throw new Error(result.error || "Fehler beim Speichern");
    }

    router.push(`/salon/${salonId}/stylists`);
  };

  if (isLoading || !stylist) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Stylist bearbeiten" subtitle="Lade Daten..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Stylist bearbeiten"
        subtitle={`Bearbeite die Details von ${stylist.name}`}
      />
      <StylistForm
        stylist={stylist}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/salon/${salonId}/stylists`)}
        saveLabel="Änderungen speichern"
      />
    </div>
  );
}
