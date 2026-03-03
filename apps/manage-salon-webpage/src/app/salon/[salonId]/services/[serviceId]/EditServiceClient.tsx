"use client";

import { useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import ServiceForm from "../ServiceForm.component";
import AssignmentList from "@/components/AssignmentList";
import {
  updateServiceDefinition,
  assignStylistToService,
  unassignStylistFromService,
} from "../service.actions";
import type {
  ServiceDefinition,
  SalonResource,
  StylistServiceAssignment,
} from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface EditServiceClientProps {
  salonId: string;
  serviceId: string;
  initialService: ServiceDefinition;
  initialResources: SalonResource[];
  initialAssignments: StylistServiceAssignment[];
  allStylists: { id: string; name: string }[];
}

export default function EditServiceClient({
  salonId,
  serviceId,
  initialService,
  initialResources,
  initialAssignments,
  allStylists,
}: EditServiceClientProps) {
  const { showNotification } = useNotifications();
  const [assignments, setAssignments] =
    useState<StylistServiceAssignment[]>(initialAssignments);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    phases: ServiceDefinition["phases"];
  }) => {
    const result = await updateServiceDefinition(salonId, serviceId, {
      name: data.name,
      description: data.description,
      phases: data.phases,
    });

    if (!result.success) {
      showNotification(result.error, "error", "long");
      throw new Error(result.error);
    }
  };

  const handleAssignStylist = useCallback(
    async (stylistId: string) => {
      const result = await assignStylistToService(
        salonId,
        stylistId,
        serviceId,
      );
      if (!result.success) {
        showNotification(result.error, "error", "long");
        return;
      }
      setAssignments((prev) => [...prev, result.data]);
    },
    [salonId, serviceId, showNotification],
  );

  const handleUnassignStylist = useCallback(
    async (stylistId: string) => {
      const result = await unassignStylistFromService(
        salonId,
        stylistId,
        serviceId,
      );
      if (!result.success) {
        showNotification(result.error, "error", "long");
        return;
      }
      setAssignments((prev) => prev.filter((a) => a.stylistId !== stylistId));
    },
    [salonId, serviceId, showNotification],
  );

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Dienstleistung bearbeiten"
        subtitle={`Bearbeite die Details von "${initialService.name}"`}
      />

      <div className="space-y-lg">
        <ServiceForm
          service={initialService}
          availableResources={initialResources}
          onSubmit={handleSubmit}
          saveLabel="Änderungen speichern"
        />

        <AssignmentList
          assignments={assignments}
          availableItems={allStylists}
          entityLabel="Stylisten"
          getAssignmentName={(a) => a.stylistName}
          getAssignmentKey={(a) => a.stylistId}
          onAssign={handleAssignStylist}
          onUnassign={handleUnassignStylist}
        />
      </div>
    </div>
  );
}
