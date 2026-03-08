import { fetchSections } from "@/api/sections-actions";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import CenterTextForm from "./center-text.form";

export const dynamic = "force-dynamic";

export default async function CenterTextEditPage({
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

  if (!section || section.type !== "center-text") {
    redirect(`/salon/${salonId}/website/${websiteId}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Text Abschnitt bearbeiten"
        subtitle="Passen Sie den Titel und Inhalt für diesen Abschnitt an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <CenterTextForm key={section.id} section={section} />
      </div>
    </div>
  );
}
