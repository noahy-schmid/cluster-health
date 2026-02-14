"use client";

import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import PageHeader from "@/components/PageHeader";

interface StylistsPageHeaderProps {
  salonId: string;
}

export default function StylistsPageHeader({
  salonId,
}: StylistsPageHeaderProps) {
  const router = useRouter();

  const handleAddStylist = () => {
    router.push(`/salon/${salonId}/stylists/create`);
  };

  return (
    <PageHeader
      title="Stylisten"
      subtitle="Verwalte die Stylisten deines Salons"
      actions={[
        {
          icon: Plus,
          text: "Stylist hinzufügen",
          onClick: handleAddStylist,
        },
      ]}
    />
  );
}
