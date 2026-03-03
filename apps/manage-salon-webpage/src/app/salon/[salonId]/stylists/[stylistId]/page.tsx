"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StylistForm, {
  StylistFormData,
} from "@/components/stylists/StylistForm";
import BackButton from "@/components/BackButton";
import AssignmentList from "@/components/AssignmentList";
import {
  fetchStylist,
  updateStylist,
} from "@/app/salon/[salonId]/stylists/stylist.actions";
import {
  fetchServicesForStylist,
  fetchServiceDefinitions,
  assignStylistToService,
  unassignStylistFromService,
} from "@/app/salon/[salonId]/services/service.actions";
import { Stylist } from "@repo/salon-domain";
import type { StylistServiceAssignment } from "@/lib/types/service-types";
import { useNotifications } from "@/components/notifications/useNotifications";

interface EditStylistPageProps {
  params: Promise<{ salonId: string; stylistId: string }>;
}

export default function EditStylistPage({ params }: EditStylistPageProps) {
  const router = useRouter();
  const { showNotification } = useNotifications();
  const [salonId, setSalonId] = useState<string>("");
  const [stylistId, setStylistId] = useState<string>("");
  const [stylist, setStylist] = useState<Stylist | undefined>(undefined);
  const [assignments, setAssignments] = useState<StylistServiceAssignment[]>(
    [],
  );
  const [allServices, setAllServices] = useState<
    { id: string; name: string }[]
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadParams = async () => {
      const resolvedParams = await params;
      setSalonId(resolvedParams.salonId);
      setStylistId(resolvedParams.stylistId);
    };
    loadParams();
  }, [params]);

  useEffect(() => {
    if (!salonId || !stylistId) return;

    const loadData = async () => {
      setIsLoading(true);

      const [stylistResult, assignmentsResult, servicesResult] =
        await Promise.all([
          fetchStylist(salonId, stylistId),
          fetchServicesForStylist(salonId, stylistId),
          fetchServiceDefinitions(salonId),
        ]);

      if (!stylistResult.success) {
        console.error("Failed to load stylist:", stylistResult.error);
        router.push(`/salon/${salonId}/stylists`);
        return;
      }

      setStylist(stylistResult.data);

      if (assignmentsResult.success) {
        setAssignments(assignmentsResult.data);
      }

      if (servicesResult.success) {
        setAllServices(
          servicesResult.data.map((s) => ({ id: s.id, name: s.name })),
        );
      }

      setIsLoading(false);
    };

    loadData();
  }, [salonId, stylistId, router]);

  const handleSubmit = async (data: StylistFormData) => {
    if (!stylist) return;

    const result = await updateStylist(salonId, stylist.id, data);

    if (!result.success) {
      throw new Error(result.error || "Fehler beim Speichern");
    }

    router.push(`/salon/${salonId}/stylists`);
  };

  const handleAssignService = useCallback(
    async (serviceId: string) => {
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
    [salonId, stylistId, showNotification],
  );

  const handleUnassignService = useCallback(
    async (serviceId: string) => {
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
        prev.filter((a) => a.serviceId !== serviceId),
      );
    },
    [salonId, stylistId, showNotification],
  );

  if (isLoading || !stylist) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader title="Stylist bearbeiten" subtitle="Lade Daten..." />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Stylist bearbeiten"
        subtitle={`Bearbeite die Details von ${stylist.name}`}
      />
      <div className="space-y-lg">
        <StylistForm
          stylist={stylist}
          onSubmit={handleSubmit}
          onCancel={() => router.push(`/salon/${salonId}/stylists`)}
          saveLabel="Änderungen speichern"
        />

        <AssignmentList
          assignments={assignments}
          availableItems={allServices}
          entityLabel="Dienstleistungen"
          getAssignmentName={(a) => a.serviceName}
          getAssignmentKey={(a) => a.serviceId}
          onAssign={handleAssignService}
          onUnassign={handleUnassignService}
        />
      </div>
    </div>
  );
}
