"use client";

import { useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import StylistForm, {
  StylistFormData,
} from "@/components/stylists/StylistForm";
import AssignmentList from "@/components/AssignmentList";
import { updateStylist } from "@/app/salon/[salonId]/stylists/stylist.actions";
import {
  assignStylistToService,
  unassignStylistFromService,
} from "@/app/salon/[salonId]/services/service.actions";
import { useNotifications } from "@/components/notifications/useNotifications";
import { StylistDto } from "../stylist.dto";
import { EmployeeServiceItem } from "@repo/salon-domain";

interface EditStylistClientProps {
  salonId: string;
  stylistId: string;
  initialStylist: StylistDto;
  initialAssignments: EmployeeServiceItem[];
  allServices: { id: string; name: string }[];
}

export default function EditStylistClient({
  salonId,
  stylistId,
  initialStylist,
  initialAssignments,
  allServices,
}: EditStylistClientProps) {
  const { showNotification } = useNotifications();
  const [assignments, setAssignments] =
    useState<EmployeeServiceItem[]>(initialAssignments);

  const handleSubmit = async (data: StylistFormData) => {
    const result = await updateStylist(salonId, initialStylist.id, {
      name: data.name,
      subtitle: data.subtitle,
      description: data.description,
      profileImageMediaId: data.profileImageMediaId,
    });

    if (!result.success) {
      showNotification(
        result.error || "Fehler beim Speichern",
        "error",
        "long",
      );
      throw new Error(result.error || "Fehler beim Speichern");
    }
  };

  const handleAssignService = useCallback(
    async (serviceId: string) => {
      const result = await assignStylistToService(stylistId, serviceId);
      if (!result.success) {
        showNotification(result.error, "error", "long");
        return;
      }
      const serviceName =
        allServices.find((s) => s.id === serviceId)?.name ||
        "Unbekannte Dienstleistung";
      setAssignments((prev) => [
        ...prev,
        {
          serviceDefinitionId: result.data.serviceDefinitionId,
          serviceName,
          createdAt: result.data.createdAt,
        },
      ]);
    },
    [stylistId, showNotification, allServices],
  );

  const handleUnassignService = useCallback(
    async (serviceId: string) => {
      const result = await unassignStylistFromService(stylistId, serviceId);
      if (!result.success) {
        showNotification(result.error, "error", "long");
        return;
      }
      setAssignments((prev) =>
        prev.filter((a) => a.serviceDefinitionId !== serviceId),
      );
    },
    [stylistId, showNotification],
  );

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Stylist bearbeiten"
        subtitle={`Bearbeite die Details von ${initialStylist.name}`}
      />
      <div className="space-y-lg">
        <StylistForm
          salonId={salonId}
          stylist={initialStylist}
          onSubmit={handleSubmit}
        />

        <AssignmentList
          assignments={assignments}
          availableItems={allServices}
          entityLabel="Dienstleistungen"
          getAssignmentName={(a) => a.serviceName}
          getAssignmentKey={(a) => a.serviceDefinitionId}
          onAssign={handleAssignService}
          onUnassign={handleUnassignService}
        />
      </div>
    </div>
  );
}
