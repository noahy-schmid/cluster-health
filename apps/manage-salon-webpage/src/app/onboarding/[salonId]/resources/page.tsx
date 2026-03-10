import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import { fetchSalon, fetchSalonResources } from "@/api/salon-actions";
import ResourceOnboardingClient from "./client";

interface ResourceOnboardingPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function ResourceOnboardingPage({
  params,
}: ResourceOnboardingPageProps) {
  const { salonId } = await params;
  const [salonResult, resourcesResult] = await Promise.all([
    fetchSalon(salonId),
    fetchSalonResources(salonId),
  ]);

  if (!salonResult.success || !resourcesResult.success) {
    let errorMessage = "Die Ressourcen konnten nicht geladen werden.";
    if (!salonResult.success) {
      errorMessage = salonResult.error;
    } else if (!resourcesResult.success) {
      errorMessage = resourcesResult.error;
    }

    return (
      <div className="min-h-screen bg-bg-0 text-fg-normal">
        <div className="mx-auto max-w-4xl px-lg py-xl md:py-2xl">
          <BackButton text="Zurück" />
          <PageHeader
            title="Ressourcen einrichten"
            subtitle="Die Resource-Konfiguration konnte nicht geladen werden."
          />
          <div className="rounded-lg border border-border bg-bg-1 p-lg text-fg-muted">
            {errorMessage}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-0 text-fg-normal">
      <div className="mx-auto max-w-4xl px-lg py-xl md:py-2xl">
        <BackButton text="Zurück" />
        <PageHeader
          title="Ressourcen einrichten"
          subtitle={`Legen Sie die wichtigsten Ressourcen für ${salonResult.data.name} fest.`}
        />
        <ResourceOnboardingClient
          salonId={salonId}
          initialResources={resourcesResult.data}
        />
      </div>
    </div>
  );
}
