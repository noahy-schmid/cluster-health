import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import {
  fetchServiceDefinition,
  fetchSalonResources,
  fetchStylistsForService,
} from "../service.actions";
import { fetchStylists } from "@/app/salon/[salonId]/stylists/stylist.actions";
import EditServiceClient from "./EditServiceClient";

export const dynamic = "force-dynamic";

interface EditServicePageProps {
  params: Promise<{ salonId: string; serviceId: string }>;
}

export default async function EditServicePage({
  params,
}: EditServicePageProps) {
  const { salonId, serviceId } = await params;

  const [serviceResult, resourcesResult, assignmentsResult, stylistsResult] =
    await Promise.all([
      fetchServiceDefinition(salonId, serviceId),
      fetchSalonResources(salonId),
      fetchStylistsForService(salonId, serviceId),
      fetchStylists(salonId),
    ]);

  if (!serviceResult.success) {
    return (
      <div className="max-w-4xl mx-auto">
        <BackButton text="Zurück" />
        <PageHeader
          title="Dienstleistung bearbeiten"
          subtitle="Dienstleistung nicht gefunden"
        />
      </div>
    );
  }

  return (
    <EditServiceClient
      salonId={salonId}
      serviceId={serviceId}
      initialService={serviceResult.data}
      initialResources={resourcesResult.success ? resourcesResult.data : []}
      initialAssignments={
        assignmentsResult.success ? assignmentsResult.data : []
      }
      allStylists={
        stylistsResult.success
          ? stylistsResult.data.map((s) => ({ id: s.id, name: s.name }))
          : []
      }
    />
  );
}
