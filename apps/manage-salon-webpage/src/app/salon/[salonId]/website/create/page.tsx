"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import { createWebsite } from "@/api/website-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";

export default function WebsiteCreatePage() {
  const router = useRouter();
  const { salonId } = useWebsiteRouteContext();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCreate = async () => {
    setIsSubmitting(true);
    setError(null);

    const result = await createWebsite();

    if (result.success) {
      router.replace(`/salon/${salonId}/website/${result.websiteId}`);
      return;
    }

    setError(result.error);
    setIsSubmitting(false);
  };

  return (
    <div className="max-w-3xl mx-auto">
      <PageHeader
        title="Webseite erstellen"
        subtitle="Erstellen Sie Ihre neue Salon-Webseite und starten Sie mit der Anpassung."
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg flex flex-col gap-lg">
        <p className="text-fg-normal">
          Sie konnen jetzt Ihre Salon-Webseite erstellen. Danach gelangen Sie
          direkt in den Editor.
        </p>

        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="flex items-center gap-sm">
          <button
            type="button"
            onClick={handleCreate}
            disabled={isSubmitting}
            className="px-md py-sm rounded-md bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            {isSubmitting ? "Erstelle..." : "Webseite erstellen"}
          </button>
          <button
            type="button"
            onClick={() => router.replace(`/salon/${salonId}`)}
            className="px-md py-sm rounded-md border border-border text-fg-normal hover:bg-bg-2"
          >
            Abbrechen
          </button>
        </div>
      </div>
    </div>
  );
}
