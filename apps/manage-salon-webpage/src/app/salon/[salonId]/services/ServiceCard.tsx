"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2, Clock } from "lucide-react";
import { useState } from "react";
import type { ServiceDefinition } from "@/lib/types/service-types";
import { deleteServiceDefinition } from "./service.actions";
import FlatIconButton from "@/components/buttons/FlatIconButton";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import { useNotifications } from "@/components/notifications/useNotifications";

interface ServiceCardProps {
  service: ServiceDefinition;
  salonId: string;
}

export default function ServiceCard({ service, salonId }: ServiceCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const { showNotification } = useNotifications();

  const totalDuration = service.phases.reduce(
    (sum, p) => sum + p.durationMinutes,
    0,
  );

  const handleEdit = () => {
    router.push(`/salon/${salonId}/services/${service.id}`);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    if (!confirm(`Möchtest du "${service.name}" wirklich löschen?`)) {
      setIsDeleting(false);
      return;
    }

    const result = await deleteServiceDefinition(salonId, service.id);

    if (!result.success) {
      showNotification(
        `Fehler beim Löschen: ${result.error}`,
        "error",
        "long",
      );
      setIsDeleting(false);
      return;
    }

    router.refresh();
  };

  return (
    <div className="bg-bg-1 rounded-lg overflow-hidden shadow-sm border border-border flex flex-col">
      <div className="p-lg flex flex-col justify-between grow">
        <div>
          <h3 className="font-focus text-fg-normal text-lg">{service.name}</h3>
          {service.description && (
            <p className="font-unfocus text-fg-muted text-sm mt-1 line-clamp-2">
              {service.description}
            </p>
          )}
          <div className="flex items-center gap-sm mt-md text-fg-muted">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{totalDuration} Min.</span>
            <span className="text-sm">·</span>
            <span className="text-sm">
              {service.phases.length}{" "}
              {service.phases.length === 1 ? "Phase" : "Phasen"}
            </span>
          </div>
        </div>
        <div className="flex gap-sm mt-md">
          <div className="flex-1">
            <FlatIconTextButton
              icon={Pencil}
              text="Bearbeiten"
              onClick={handleEdit}
              elevation={1}
            />
          </div>
          <FlatIconButton
            icon={Trash2}
            onClick={handleDelete}
            ariaLabel="Löschen"
            elevation={1}
            isError={true}
          />
        </div>
      </div>
    </div>
  );
}
