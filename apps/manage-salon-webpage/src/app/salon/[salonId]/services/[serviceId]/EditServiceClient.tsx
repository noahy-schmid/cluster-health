"use client";

import { useState, useCallback } from "react";
import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import ServiceForm from "../ServiceForm.component";
import SimpleServiceForm from "../SimpleServiceForm.component";
import ColorationServiceForm from "../ColorationServiceForm.component";
import AssignmentList from "@/components/AssignmentList";
import {
  updateServiceDefinition,
  assignStylistToService,
  unassignStylistFromService,
} from "../service.actions";
import type {
  ServiceDefinition,
  Resource,
  ServiceEmployeeItem,
} from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface EditServiceClientProps {
  serviceId: string;
  initialService: ServiceDefinition;
  initialResources: Resource[];
  initialAssignments: ServiceEmployeeItem[];
  allStylists: { id: string; name: string }[];
}

export default function EditServiceClient({
  serviceId,
  initialService,
  initialResources,
  initialAssignments,
  allStylists,
}: EditServiceClientProps) {
  const { showNotification } = useNotifications();
  const [assignments, setAssignments] =
    useState<ServiceEmployeeItem[]>(initialAssignments);

  const handleSubmit = async (data: {
    name: string;
    description: string;
    priceInCents: number;
    phases: ServiceDefinition["phases"];
  }) => {
    const result = await updateServiceDefinition(serviceId, {
      name: data.name,
      description: data.description,
      priceInCents: data.priceInCents,
      phases: data.phases,
    });

    if (!result.success) {
      showNotification(result.error, "error", "long");
      throw new Error(result.error);
    }
  };

  const handleAssignStylist = useCallback(
    async (stylistId: string) => {
      const result = await assignStylistToService(stylistId, serviceId);
      if (!result.success) {
        showNotification(result.error, "error", "long");
        return;
      }
      setAssignments((prev) => [
        ...prev,
        {
          stylistId: result.data.stylistId,
          createdAt: result.data.createdAt,
          stylistName:
            allStylists.find((s) => s.id === stylistId)?.name ||
            "Unbekannter Stylist",
        },
      ]);
    },
    [serviceId, showNotification, allStylists],
  );

  const handleUnassignStylist = useCallback(
    async (stylistId: string) => {
      const result = await unassignStylistFromService(stylistId, serviceId);
      if (!result.success) {
        showNotification(result.error, "error", "long");
        return;
      }
      setAssignments((prev) => prev.filter((a) => a.stylistId !== stylistId));
    },
    [serviceId, showNotification],
  );

  const renderForm = () => {
    switch (initialService.serviceType) {
      case "simple":
        return (
          <SimpleServiceForm
            service={initialService}
            onSubmit={handleSubmit}
            saveLabel="Änderungen speichern"
          />
        );
      case "coloration":
        return (
          <ColorationServiceForm
            service={initialService}
            onSubmit={handleSubmit}
            saveLabel="Änderungen speichern"
          />
        );
      case "custom":
      default:
        return (
          <ServiceForm
            service={initialService}
            availableResources={initialResources}
            onSubmit={handleSubmit}
            saveLabel="Änderungen speichern"
          />
        );
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Dienstleistung bearbeiten"
        subtitle={`Bearbeite die Details von "${initialService.name}"`}
      />

      <div className="space-y-lg">
        {renderForm()}

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
