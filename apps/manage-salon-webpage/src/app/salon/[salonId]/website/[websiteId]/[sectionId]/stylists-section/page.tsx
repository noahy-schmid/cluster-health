import { fetchSections } from "@/api/sections-actions";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import StylistsForm from "./stylists-section.form";

export default async function StylistsEditPage({
  params,
}: {
  params: Promise<{ salonId: string; websiteId: string; sectionId: string }>;
}) {
  const { salonId, websiteId, sectionId } = await params;
  const result = await fetchSections(websiteId);

  if (!result.success || !result.data) {
    redirect(`/salon/${salonId}`);
  }

  const section = result.data.find((item) => item.id === sectionId);

  if (!section || section.type !== "stylists-section") {
    redirect(`/salon/${salonId}/website/${websiteId}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Team Abschnitt bearbeiten"
        subtitle="Passen Sie den Titel und Untertitel für diesen Abschnitt an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <StylistsForm key={section.id} section={section} />
      </div>
    </div>
  );
}
