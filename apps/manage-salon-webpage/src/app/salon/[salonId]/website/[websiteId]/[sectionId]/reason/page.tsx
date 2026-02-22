import { fetchSections } from "@/api/sections-actions";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ReasonForm from "./reason.form";

export default async function ReasonEditPage({
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

  if (!section || section.type !== "reason") {
    redirect(`/salon/${salonId}/website/${websiteId}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Grunde Abschnitt bearbeiten"
        subtitle="Passen Sie die Grunde für diesen Abschnitt an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <ReasonForm key={section.id} section={section} />
      </div>
    </div>
  );
}
