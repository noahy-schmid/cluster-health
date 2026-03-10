"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Scissors, Paintbrush, Settings } from "lucide-react";
import ServiceForm from "../ServiceForm.component";
import SimpleServiceForm from "../SimpleServiceForm.component";
import ColorationServiceForm from "../ColorationServiceForm.component";
import {
  createSimpleService,
  createColorationService,
  createCustomService,
} from "../service.actions";
import type { Resource } from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";
import TypeSelectionPanel, {
  type TypeSelectionOption,
} from "@/components/TypeSelectionPanel";
import { ServiceType } from "@repo/salon-domain";

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
  availableResources: Resource[];
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

  const handleSimpleSubmit = async (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: { durationMinutes: number }[];
  }) => {
    const result = await createSimpleService({
      salonId,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      durationMinutes: data.phases[0]?.durationMinutes ?? 30,
    });

    if (!result.success) {
      showNotification(result.error, "error", "long");
      throw new Error(result.error);
    }
    router.push(`/salon/${salonId}/services`);
  };

  const handleColorationSubmit = async (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: { durationMinutes: number }[];
  }) => {
    const result = await createColorationService({
      salonId,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      applicationDurationMinutes: data.phases[0]?.durationMinutes ?? 20,
      processingDurationMinutes: data.phases[1]?.durationMinutes ?? 30,
      finishingDurationMinutes: data.phases[2]?.durationMinutes ?? 15,
    });

    if (!result.success) {
      showNotification(result.error, "error", "long");
      throw new Error(result.error);
    }
    router.push(`/salon/${salonId}/services`);
  };

  const handleCustomSubmit = async (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: {
      name: string;
      durationMinutes: number;
      employeeRequired: boolean;
      requiredResourceSlugs: string[];
      order: number;
    }[];
  }) => {
    const result = await createCustomService({
      salonId,
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
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
        onSubmit={handleSimpleSubmit}
        onCancel={handleCancel}
        saveLabel="Dienstleistung erstellen"
      />
    );
  }

  if (selectedType === "coloration") {
    return (
      <ColorationServiceForm
        onSubmit={handleColorationSubmit}
        onCancel={handleCancel}
        saveLabel="Dienstleistung erstellen"
      />
    );
  }

  return (
    <ServiceForm
      availableResources={availableResources}
      onSubmit={handleCustomSubmit}
      onCancel={handleCancel}
      saveLabel="Dienstleistung erstellen"
    />
  );
}
