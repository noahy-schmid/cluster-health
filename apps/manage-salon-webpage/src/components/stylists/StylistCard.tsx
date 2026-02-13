"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { Stylist } from "@repo/salon-domain";
import { deleteStylist } from "@/api/stylists-actions";
import { useState } from "react";

interface StylistCardProps {
  stylist: Stylist;
  salonId: string;
}

export default function StylistCard({ stylist, salonId }: StylistCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);

  const handleEdit = () => {
    router.push(`/salon/${salonId}/stylists/${stylist.id}`);
  };

  const handleDelete = async () => {
    if (!confirm(`Möchtest du ${stylist.name} wirklich löschen?`)) {
      return;
    }

    setIsDeleting(true);
    const result = await deleteStylist(salonId, stylist.id);

    if (!result.success) {
      alert(`Fehler beim Löschen: ${result.error}`);
      setIsDeleting(false);
      return;
    }

    // Refresh the page to show updated list
    router.refresh();
  };

  return (
    <div className="bg-bg-1 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <div className="aspect-square relative">
        <img
          src={stylist.profileImage}
          alt={stylist.name}
          className="w-full h-full object-cover"
        />
      </div>
      <div className="p-md">
        <h3 className="text-xl font-brand font-focus text-fg-brand">
          {stylist.name}
        </h3>
        <p className="text-sm text-fg-muted mb-sm">{stylist.subtitle}</p>
        <p className="text-base text-fg-normal line-clamp-3">
          {stylist.description}
        </p>
        <div className="flex gap-sm mt-md">
          <button
            onClick={handleEdit}
            className="flex-1 flex items-center justify-center gap-sm p-sm rounded-md bg-bg-2 hover:bg-accent text-fg-normal hover:text-on-accent transition-colors"
          >
            <Pencil className="w-4 h-4" />
            Bearbeiten
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center gap-sm p-sm rounded-md bg-bg-2 hover:bg-red-500 text-fg-normal hover:text-white transition-colors disabled:opacity-50"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
