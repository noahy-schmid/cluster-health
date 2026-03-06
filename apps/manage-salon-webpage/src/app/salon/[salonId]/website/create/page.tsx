import PageHeader from "@/components/PageHeader";
import { getWebsiteInitialValues } from "../settings.actions";
import WebsiteCreateClient from "./client";
import { redirect } from "next/navigation";

export default async function WebsiteCreatePage({
  params,
}: {
  params: Promise<{ salonId: string }>;
}) {
  const { salonId } = await params;

  const initialValuesResult = await getWebsiteInitialValues();

  if (!initialValuesResult.success) {
    // If we can't get initial values, redirect back to salon page
    redirect(`/salon/${salonId}`);
  }

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Webseite erstellen"
        subtitle="Konfigurieren Sie die grundlegenden Einstellungen für Ihre neue Salon-Webseite."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <WebsiteCreateClient
          salonId={salonId}
          initialValues={{
            slug: initialValuesResult.slug,
            title: initialValuesResult.title,
            faviconMediaId: initialValuesResult.faviconMediaId,
          }}
        />
      </div>
    </div>
  );
}
