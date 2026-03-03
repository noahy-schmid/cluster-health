import type { ServiceDefinition } from "@/lib/types/service-types";
import ServiceCard from "./ServiceCard";

interface ServiceListProps {
  services: ServiceDefinition[];
  salonId: string;
}

export default function ServiceList({ services, salonId }: ServiceListProps) {
  if (services.length === 0) {
    return (
      <div className="text-center py-xl">
        <p className="text-fg-muted text-lg">
          Noch keine Dienstleistungen vorhanden. Erstelle deine erste
          Dienstleistung!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-lg">
      {services.map((service) => (
        <ServiceCard key={service.id} service={service} salonId={salonId} />
      ))}
    </div>
  );
}
