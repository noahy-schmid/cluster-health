import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import { fetchSalonResources } from "../service.actions";
import CreateServiceClient from "./CreateServiceClient";

interface CreateServicePageProps {
  params: Promise<{ salonId: string }>;
}

export default async function CreateServicePage({
  params,
}: CreateServicePageProps) {
  const { salonId } = await params;
  const resourcesResult = await fetchSalonResources(salonId);

  return (
    <div className="max-w-4xl mx-auto">
      <BackButton text="Zurück" />
      <PageHeader
        title="Neue Dienstleistung"
        subtitle="Erstelle eine neue Dienstleistung für deinen Salon"
      />
      <CreateServiceClient
        salonId={salonId}
        availableResources={resourcesResult.success ? resourcesResult.data : []}
      />
    </div>
  );
}
