import { redirect } from "next/navigation";
import { fetchSections } from "@/api/sections-actions";
import { getHeroSettings } from "@/api/website-actions";
import WebsiteEditorClient from "@/components/website/WebsiteEditorClient";

export default async function WebsiteEditorPage({
  params,
}: {
  params: Promise<{ salonId: string; websiteId: string }>;
}) {
  const { salonId, websiteId } = await params;

  const [sectionsResult, heroResult] = await Promise.all([
    fetchSections(websiteId),
    getHeroSettings(websiteId),
  ]);

  if (!sectionsResult.success || !heroResult.success) {
    redirect(`/salon/${salonId}`);
  }

  return (
    <WebsiteEditorClient
      initialSections={sectionsResult.data ?? []}
      heroSettings={heroResult.settings}
    />
  );
}
