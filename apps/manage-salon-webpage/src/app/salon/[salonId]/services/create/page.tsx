"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import ServiceForm from "../ServiceForm.component";
import {
  createServiceDefinition,
  fetchSalonResources,
} from "../service.actions";
import type { SalonResource } from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface CreateServicePageProps {
  params: Promise<{ salonId: string }>;
}

export default function CreateServicePage({ params }: CreateServicePageProps) {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const [salonId, setSalonId] = useState<string>("");
  const [resources, setResources] = useState<SalonResource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const resolvedParams = await params;
      setSalonId(resolvedParams.salonId);

      const resourcesResult = await fetchSalonResources(
        resolvedParams.salonId,
      );
      if (resourcesResult.success) {
        setResources(resourcesResult.data);
      }
      setIsLoading(false);
    };
    load();
  }, [params]);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    phases: { name: string; durationMinutes: number; requiresEmployee: boolean; requiredResources: { resourceId: string; resourceName: string }[]; order: number }[];
  }) => {
    const result = await createServiceDefinition({
      salonId,
      name: data.name,
      description: data.description,
      phases: data.phases,
    });

    if (!result.success) {
      showNotification(result.error, "error", "long");
      throw new Error(result.error);
    }

    router.push(`/salon/${salonId}/services`);
  };

  if (isLoading || !salonId) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Neue Dienstleistung" subtitle="Lade Daten..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Neue Dienstleistung"
        subtitle="Erstelle eine neue Dienstleistung für deinen Salon"
      />
      <ServiceForm
        availableResources={resources}
        onSubmit={handleSubmit}
        onCancel={() => router.push(`/salon/${salonId}/services`)}
        saveLabel="Dienstleistung erstellen"
      />
    </div>
  );
}
