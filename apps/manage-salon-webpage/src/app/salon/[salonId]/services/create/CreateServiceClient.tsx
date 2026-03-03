"use client";

import { useRouter } from "next/navigation";
import ServiceForm from "../ServiceForm.component";
import { createServiceDefinition } from "../service.actions";
import type { SalonResource } from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface CreateServiceClientProps {
  salonId: string;
  availableResources: SalonResource[];
}

export default function CreateServiceClient({
  salonId,
  availableResources,
}: CreateServiceClientProps) {
  const router = useRouter();
  const { showNotification } = useNotifications();

  const handleSubmit = async (data: {
    name: string;
    description: string;
    phases: {
      name: string;
      durationMinutes: number;
      requiresEmployee: boolean;
      requiredResources: { resourceId: string; resourceName: string }[];
      order: number;
    }[];
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

  return (
    <ServiceForm
      availableResources={availableResources}
      onSubmit={handleSubmit}
      onCancel={() => router.push(`/salon/${salonId}/services`)}
      saveLabel="Dienstleistung erstellen"
    />
  );
}
