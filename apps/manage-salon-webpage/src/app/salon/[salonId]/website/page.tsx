import { redirect } from "next/navigation";
import { getWebsiteIdForSalon } from "@/api/website-actions";

export default async function SalonWebsiteIndexPage({
  params,
}: {
  params: Promise<{ salonId: string }>;
}) {
  const { salonId } = await params;
  const result = await getWebsiteIdForSalon(salonId);

  if (!result.success) {
    redirect(`/salon/${salonId}`);
  }

  if (result.websiteId) {
    redirect(`/salon/${salonId}/website/${result.websiteId}`);
  }

  redirect(`/salon/${salonId}/website/create`);
}
