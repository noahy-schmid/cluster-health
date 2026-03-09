import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import { fetchStylist } from "@/app/salon/[salonId]/stylists/stylist.actions";
import {
  fetchServicesForStylist,
  fetchServiceDefinitions,
} from "@/app/salon/[salonId]/services/service.actions";
import EditStylistClient from "./EditStylistClient";

interface EditStylistPageProps {
  params: Promise<{ salonId: string; stylistId: string }>;
}

export default async function EditStylistPage({
  params,
}: EditStylistPageProps) {
  const { salonId, stylistId } = await params;

  const [stylistResult, assignmentsResult, servicesResult] = await Promise.all([
    fetchStylist(salonId, stylistId),
    fetchServicesForStylist(salonId, stylistId),
    fetchServiceDefinitions(salonId),
  ]);

  if (!stylistResult.success) {
    return (
      <div className="max-w-4xl mx-auto">
        <BackButton text="Zurück" />
        <PageHeader
          title="Stylist bearbeiten"
          subtitle="Stylist nicht gefunden"
        />
      </div>
    );
  }

  return (
    <EditStylistClient
      salonId={salonId}
      stylistId={stylistId}
      initialStylist={stylistResult.data}
      initialAssignments={
        assignmentsResult.success ? assignmentsResult.data : []
      }
      allServices={
        servicesResult.success
          ? servicesResult.data.map((s) => ({ id: s.id, name: s.name }))
          : []
      }
    />
  );
}
