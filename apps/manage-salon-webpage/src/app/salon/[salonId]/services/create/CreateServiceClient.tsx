"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Paintbrush, Settings } from "lucide-react";
import ServiceForm from "../ServiceForm.component";
import SimpleServiceForm from "../SimpleServiceForm.component";
import ColorationServiceForm from "../ColorationServiceForm.component";
import { createServiceDefinition } from "../service.actions";
import type { SalonResource, ServiceType } from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";
import TypeSelectionPanel, {
  type TypeSelectionOption,
} from "@/components/TypeSelectionPanel";

const serviceTypeOptions: TypeSelectionOption<ServiceType>[] = [
  {
    type: "simple",
    label: "Einfach",
    description:
      "Eine einfache Dienstleistung mit einer Phase, die einen Mitarbeiter und einen Stuhl benötigt.",
    icon: Scissors,
  },
  {
    type: "coloration",
    label: "Coloration",
    description:
      "Eine Färbung mit drei Phasen: Färben, Einwirkzeit und Abschluss.",
    icon: Paintbrush,
  },
  {
    type: "custom",
    label: "Individuell",
    description:
      "Eine vollständig anpassbare Dienstleistung mit beliebigen Phasen und Ressourcen.",
    icon: Settings,
  },
];

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
  const [selectedType, setSelectedType] = useState<ServiceType | undefined>(
    undefined,
  );

  const handleSubmit = async (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: {
      name: string;
      durationMinutes: number;
      requiresEmployee: boolean;
      requiredResources: { resourceId: string; resourceName: string }[];
      order: number;
    }[];
  }) => {
    if (!selectedType) return;

    const result = await createServiceDefinition({
      salonId,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      serviceType: selectedType,
      phases: data.phases,
    });

    if (!result.success) {
      showNotification(result.error, "error", "long");
      throw new Error(result.error);
    }

    router.push(`/salon/${salonId}/services`);
  };

  const handleCancel = () => router.push(`/salon/${salonId}/services`);

  if (!selectedType) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-lg">
        <TypeSelectionPanel
          options={serviceTypeOptions}
          onSelect={setSelectedType}
        />
      </div>
    );
  }

  if (selectedType === "simple") {
    return (
      <SimpleServiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        saveLabel="Dienstleistung erstellen"
      />
    );
  }

  if (selectedType === "coloration") {
    return (
      <ColorationServiceForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        saveLabel="Dienstleistung erstellen"
      />
    );
  }

  return (
    <ServiceForm
      availableResources={availableResources}
      onSubmit={handleSubmit}
      onCancel={handleCancel}
      saveLabel="Dienstleistung erstellen"
    />
  );
}
