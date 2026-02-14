"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StylistForm from "@/components/stylists/StylistForm";
import BackButton from "@/components/BackButton";

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
        salonId={salonId}
        onSuccess={() => router.push(`/salon/${salonId}/stylists`)}
        onCancel={() => router.push(`/salon/${salonId}/stylists`)}
      />
    </div>
  );
}
