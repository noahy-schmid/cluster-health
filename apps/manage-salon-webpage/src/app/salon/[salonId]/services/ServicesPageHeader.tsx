"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface ServicesPageHeaderProps {
  salonId: string;
}

export default function ServicesPageHeader({
  salonId,
}: ServicesPageHeaderProps) {
  const router = useRouter();

  const handleAdd = () => {
    router.push(`/salon/${salonId}/services/create`);
  };

  return (
    <PageHeader
      title="Dienstleistungen"
      subtitle="Verwalte die Dienstleistungen deines Salons"
      actions={[
        {
          icon: Plus,
          text: "Dienstleistung erstellen",
          onClick: handleAdd,
        },
      ]}
    />
  );
}
