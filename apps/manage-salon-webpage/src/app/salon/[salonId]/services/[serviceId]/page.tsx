"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import ServiceForm from "../ServiceForm.component";
import AssignmentList from "@/components/AssignmentList";
import {
  fetchServiceDefinition,
  updateServiceDefinition,
  fetchSalonResources,
  fetchStylistsForService,
  assignStylistToService,
  unassignStylistFromService,
} from "../service.actions";
import { fetchStylists } from "@/app/salon/[salonId]/stylists/stylist.actions";
import type {
  ServiceDefinition,
  SalonResource,
  StylistServiceAssignment,
} from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface EditServicePageProps {
  params: Promise<{ salonId: string; serviceId: string }>;
}

export default function EditServicePage({ params }: EditServicePageProps) {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const [salonId, setSalonId] = useState<string>("");
  const [serviceId, setServiceId] = useState<string>("");
  const [service, setService] = useState<ServiceDefinition | undefined>(
    undefined,
  );
  const [resources, setResources] = useState<SalonResource[]>([]);
  const [assignments, setAssignments] = useState<StylistServiceAssignment[]>(
    [],
  );
  const [allStylists, setAllStylists] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const resolvedParams = await params;
      setSalonId(resolvedParams.salonId);
      setServiceId(resolvedParams.serviceId);
    };
    load();
  }, [params]);

  useEffect(() => {
    if (!salonId || !serviceId) return;

    const loadData = async () => {
      setIsLoading(true);

      const [serviceResult, resourcesResult, assignmentsResult, stylistsResult] =
        await Promise.all([
          fetchServiceDefinition(salonId, serviceId),
          fetchSalonResources(salonId),
          fetchStylistsForService(salonId, serviceId),
          fetchStylists(salonId),
        ]);

      if (!serviceResult.success) {
        showNotification(serviceResult.error, "error", "long");
        router.push(`/salon/${salonId}/services`);
        return;
      }

      setService(serviceResult.data);

      if (resourcesResult.success) {
        setResources(resourcesResult.data);
      }

      if (assignmentsResult.success) {
        setAssignments(assignmentsResult.data);
      }

      if (stylistsResult.success) {
        setAllStylists(
          stylistsResult.data.map((s) => ({ id: s.id, name: s.name })),
        );
      }

      setIsLoading(false);
    };

    loadData();
  }, [salonId, serviceId, router, showNotification]);

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

    showNotification("Dienstleistung gespeichert", "info", "short");
    router.push(`/salon/${salonId}/services`);
  };

  const handleAssignStylist = useCallback(
    async (stylistId: string) => {
      const result = await assignStylistToService(salonId, stylistId, serviceId);
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
      setAssignments((prev) =>
        prev.filter((a) => a.stylistId !== stylistId),
      );
    },
    [salonId, serviceId, showNotification],
  );

  if (isLoading || !service) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Dienstleistung bearbeiten"
          subtitle="Lade Daten..."
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Dienstleistung bearbeiten"
        subtitle={`Bearbeite die Details von "${service.name}"`}
      />

      <div className="space-y-lg">
        <ServiceForm
          service={service}
          availableResources={resources}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/salon/${salonId}/services`)}
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
