import PageHeader from "@/components/PageHeader";
import BackButton from "@/components/BackButton";
import { fetchStylist } from "@/app/salon/[salonId]/stylists/stylist.actions";
import {
  fetchStylistAvailability,
  fetchStylistAvailabilityExceptions,
} from "./availability.actions";
import StylistAvailabilityClient from "./client";

interface StylistAvailabilityPageProps {
  params: Promise<{ salonId: string; stylistId: string }>;
}

export default async function StylistAvailabilityPage({
  params,
}: StylistAvailabilityPageProps) {
  const { salonId, stylistId } = await params;

  const [stylistResult, availabilityResult, exceptionsResult] =
    await Promise.all([
      fetchStylist(salonId, stylistId),
      fetchStylistAvailability(salonId, stylistId),
      fetchStylistAvailabilityExceptions(salonId, stylistId),
    ]);

  if (!stylistResult.success) {
    return (
      <div className="max-w-4xl mx-auto">
        <BackButton text="Zurück zu Stylisten" />
        <PageHeader
          title="Verfügbarkeit"
          subtitle="Stylist nicht gefunden"
        />
      </div>
    );
  }

  if (!availabilityResult.success) {
    return (
      <div className="max-w-4xl mx-auto">
        <BackButton text="Zurück zu Stylisten" />
        <PageHeader
          title="Verfügbarkeit"
          subtitle="Fehler beim Laden der Verfügbarkeit"
        />
        <div className="rounded-lg border border-border bg-bg-1 p-lg text-fg-muted">
          {availabilityResult.error}
        </div>
      </div>
    );
  }

  return (
    <StylistAvailabilityClient
      salonId={salonId}
      stylistId={stylistId}
      stylistName={stylistResult.data.name}
      initialAvailability={availabilityResult.data}
      initialExceptions={
        exceptionsResult.success ? exceptionsResult.data : []
      }
    />
  );
}
