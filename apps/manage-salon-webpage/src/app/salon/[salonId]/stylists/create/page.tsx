"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StylistForm, {
  StylistFormData,
} from "@/components/stylists/StylistForm";
import BackButton from "@/components/BackButton";
import { createStylist } from "@/app/salon/[salonId]/stylists/stylist.actions";

export const dynamic = "force-dynamic";

interface CreateStylistPageProps {
  params: Promise<{ salonId: string }>;
}

export default function CreateStylistPage({ params }: CreateStylistPageProps) {
  const router = useRouter();
  const [salonId, setSalonId] = useState<string>("");

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSalonId(resolvedParams.salonId);
    };
    loadParams();
  }, [params]);

  const handleSubmit = async (data: StylistFormData) => {
    const result = await createStylist({
      salonId,
      ...data,
    });

    if (!result.success) {
      throw new Error(result.error || "Fehler beim Erstellen");
    }

    router.push(`/salon/${salonId}/stylists`);
  };

  if (!salonId) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Neuer Stylist"
        subtitle="Füge einen neuen Stylisten zu deinem Team hinzu"
      />
      <StylistForm
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/salon/${salonId}/stylists`)}
        saveLabel="Stylist erstellen"
      />
    </div>
  );
}
