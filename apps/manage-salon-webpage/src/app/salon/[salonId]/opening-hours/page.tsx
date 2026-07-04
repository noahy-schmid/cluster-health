import PageHeader from "@/components/PageHeader";
import {
  fetchOpeningHours,
  fetchOpeningHoursExceptions,
} from "./opening-hours.actions";
import OpeningHoursClient from "./client";

interface OpeningHoursPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function OpeningHoursPage({
  params,
}: OpeningHoursPageProps) {
  const { salonId } = await params;

  const [hoursResult, exceptionsResult] = await Promise.all([
    fetchOpeningHours(salonId),
    fetchOpeningHoursExceptions(salonId),
  ]);

  if (!hoursResult.success) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Öffnungszeiten"
          subtitle="Fehler beim Laden der Öffnungszeiten"
        />
        <div className="rounded-lg border border-border bg-bg-1 p-lg text-fg-muted">
          {hoursResult.error}
        </div>
      </div>
    );
  }

  return (
    <OpeningHoursClient
      salonId={salonId}
      initialHours={hoursResult.data}
      initialExceptions={exceptionsResult.success ? exceptionsResult.data : []}
    />
  );
}
