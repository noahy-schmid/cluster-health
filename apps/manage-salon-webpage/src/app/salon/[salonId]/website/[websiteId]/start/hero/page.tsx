import { getHeroSettings } from "@/api/website-actions";
import HeroEditClient from "@/components/website/HeroEditClient";
import { redirect } from "next/navigation";

export default async function HeroEditPage({
  params,
}: {
  params: Promise<{ salonId: string; websiteId: string }>;
}) {
  const { websiteId, salonId } = await params;
  const heroSettings = await getHeroSettings(websiteId);

  if (!heroSettings.success) {
    console.error("Failed to load hero settings:", heroSettings.error);
    redirect(`/salon/${salonId}/website/${websiteId}`);
  }

  return <HeroEditClient initialSettings={heroSettings.settings} />;
}
