import { fetchStylists } from "@/app/salon/[salonId]/stylists/stylist.actions";
import { SalonDashboardClient } from "./dashboard.client";

interface SalonPageProps {
  params: Promise<{ salonId: string }>;
}

export default async function SalonPage({ params }: SalonPageProps) {
  const { salonId } = await params;
  const stylistsResult = await fetchStylists(salonId);
  const stylists = stylistsResult.success ? stylistsResult.data : [];

  return <SalonDashboardClient salonId={salonId} stylists={stylists} />;
}
