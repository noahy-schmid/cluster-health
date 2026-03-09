import PageHeader from "@/components/PageHeader";
import { fetchStylists } from "@/app/salon/[salonId]/stylists/stylist.actions";
import StylistList from "./StylistList";
import StylistsPageHeader from "./StylistsPageHeader";

interface StylistsPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function StylistsPage({ params }: StylistsPageProps) {
  const { salonId } = await params;
  const result = await fetchStylists(salonId);

  if (!result.success) {
    return (
      <div className="max-w-4xl mx-auto">
        <PageHeader
          title="Stylisten"
          subtitle="Fehler beim Laden der Stylisten"
        />
        <div className="text-center py-xl">
          <p className="text-fg-muted">
            {result.error || "Ein unbekannter Fehler ist aufgetreten"}
          </p>
        </div>
      </div>
    );
  }

  const stylists = result.data || [];

  return (
    <div className="max-w-4xl mx-auto">
      <StylistsPageHeader salonId={salonId} />
      <StylistList stylists={stylists} salonId={salonId} />
    </div>
  );
}
