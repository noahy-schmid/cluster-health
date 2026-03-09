import PageHeader from "@/components/PageHeader";
import { fetchServiceDefinitions } from "./service.actions";
import ServiceList from "./ServiceList";
import ServicesPageHeader from "./ServicesPageHeader";

interface ServicesPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function ServicesPage({ params }: ServicesPageProps) {
  const { salonId } = await params;
  const result = await fetchServiceDefinitions(salonId);

  if (!result.success) {
    return (
      <div className="max-w-5xl mx-auto">
        <PageHeader
          title="Dienstleistungen"
          subtitle="Fehler beim Laden der Dienstleistungen"
        />
        <div className="text-center py-xl">
          <p className="text-fg-muted">
            {result.error || "Ein unbekannter Fehler ist aufgetreten"}
          </p>
        </div>
      </div>
    );
  }

  const services = result.data || [];

  return (
    <div className="max-w-5xl mx-auto">
      <ServicesPageHeader salonId={salonId} />
      <ServiceList services={services} salonId={salonId} />
    </div>
  );
}
