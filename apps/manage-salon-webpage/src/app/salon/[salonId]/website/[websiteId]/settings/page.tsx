import { redirect } from "next/navigation";
import { getWebsiteSettings } from "../../settings.actions";
import WebsiteSettingsPageClient from "./client";

export const dynamic = "force-dynamic";

export default async function WebsiteSettingsPage({
  params,
}: {
  params: Promise<{ salonId: string; websiteId: string }>;
}) {
  const { salonId, websiteId } = await params;

  const settingsResult = await getWebsiteSettings(websiteId);

  if (!settingsResult.success) {
    redirect(`/salon/${salonId}`);
  }

  return (
    <WebsiteSettingsPageClient
      salonId={salonId}
      websiteId={websiteId}
      initialSettings={{
        slug: settingsResult.slug,
        title: settingsResult.title,
        faviconUrl: settingsResult.faviconUrl,
      }}
    />
  );
}
