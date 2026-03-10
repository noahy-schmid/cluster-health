import PageHeader from "@/components/PageHeader";
import {
  fetchSalon,
  fetchSalonResources,
} from "@/api/salon-actions";
import SalonSettingsPageClient from "./client";

interface SalonSettingsPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function SalonSettingsPage({
  params,
}: SalonSettingsPageProps) {
  const { salonId } = await params;
  const [salonResult, resourcesResult] = await Promise.all([
    fetchSalon(salonId),
    fetchSalonResources(salonId),
  ]);

  if (!salonResult.success) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Salon Einstellungen"
          subtitle="Der Salon konnte nicht geladen werden."
        />
        <div className="rounded-lg border border-border bg-bg-1 p-lg text-fg-muted">
          {salonResult.error}
        </div>
      </div>
    );
  }

  if (!resourcesResult.success) {
    return (
      <div className="mx-auto max-w-5xl">
        <PageHeader
          title="Salon Einstellungen"
          subtitle="Die Ressourcen konnten nicht geladen werden."
        />
        <div className="rounded-lg border border-border bg-bg-1 p-lg text-fg-muted">
          {resourcesResult.error}
        </div>
      </div>
    );
  }

  return (
    <SalonSettingsPageClient
      salonId={salonId}
      initialSalon={salonResult.data}
      initialResources={resourcesResult.data}
    />
  );
}
