import BackButton from "@/components/BackButton";
import PageHeader from "@/components/PageHeader";
import { fetchSalon, fetchSalonResources } from "@/api/salon-read.actions";
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
    let errorMessage =
      "Die Angaben für die Terminplanung konnten nicht geladen werden.";
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
            title="Terminplanung einrichten"
            subtitle="Die Angaben für die Terminplanung konnten nicht geladen werden."
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
          title="Terminplanung einrichten"
          subtitle={`Pflegen Sie Bedienplätze, Geräte und weitere Angaben für die Terminplanung von ${salonResult.data.name}.`}
        />
        <ResourceOnboardingClient
          salonId={salonId}
          initialResources={resourcesResult.data}
        />
      </div>
    </div>
  );
}
