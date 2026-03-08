import { fetchSections } from "@/api/sections-actions";
import { redirect } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import GalleryForm from "./gallery.form";

export const dynamic = "force-dynamic";

export default async function GalleryEditPage({
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

  if (!section || section.type !== "gallery") {
    redirect(`/salon/${salonId}/website/${websiteId}`);
  }

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Gallerie bearbeiten"
        subtitle="Passen Sie den Titel, Untertitel und die Bilder für diese Gallerie an."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <GalleryForm key={section.id} section={section} />
      </div>
    </div>
  );
}
