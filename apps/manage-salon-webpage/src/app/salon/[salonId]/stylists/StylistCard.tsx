/* eslint-disable @next/next/no-img-element */
"use client";

import { useRouter } from "next/navigation";
import { Pencil, Trash2 } from "lucide-react";
import { deleteStylist } from "@/app/salon/[salonId]/stylists/stylist.actions";
import { getMediaUrl } from "@/api/media-actions";
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import FlatIconButton from "@/components/buttons/FlatIconButton";
import FlatIconTextButton from "@/components/buttons/FlatIconTextButton";
import { StylistDto } from "./stylist.dto";

interface StylistCardProps {
  stylist: StylistDto;
  salonId: string;
}

export default function StylistCard({ stylist, salonId }: StylistCardProps) {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const profileImageMediaId = stylist.profileImageMediaId;

  const { data: profileImageUrl } = useQuery({
    queryKey: ["mediaUrl", profileImageMediaId],
    queryFn: async () => {
      if (!profileImageMediaId) return null;
      const result = await getMediaUrl(profileImageMediaId);
      if (result.success) return result.data;
      return null;
    },
    enabled: !!profileImageMediaId,
  });

  const handleEdit = () => {
    router.push(`/salon/${salonId}/stylists/${stylist.id}`);
  };

  const handleDelete = async () => {
    if (isDeleting) return;
    setIsDeleting(true);
    if (!confirm(`Möchtest du ${stylist.name} wirklich löschen?`)) {
      return;
    }

    const result = await deleteStylist(salonId, stylist.id);

    if (!result.success) {
      alert(
        `Fehler beim Löschen. Bitte überprüfe deine Internetverbindung und deine Berechtigungen und versuche es erneut.\n\nTechnische Details: ${result.error}`,
      );
      setIsDeleting(false);
      return;
    }

    // Refresh the page to show updated list
    router.refresh();
  };

  return (
    <div className="bg-bg-1 rounded-lg overflow-hidden shadow-sm border border-border sm:w-[280px] flex flex-col">
      <div className="aspect-square bg-bg-2 flex items-center justify-center">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={stylist.name}
            className="object-cover w-full h-full aspect-square"
          />
        ) : (
          <span className="text-fg-muted text-sm">Kein Bild</span>
        )}
      </div>
      <div className="p-lg flex flex-col justify-between grow">
        <div>
          <h3 className="font-focus text-fg-normal text-lg">{stylist.name}</h3>
          <p className="font-normal text-fg-muted text-sm">
            {stylist.subtitle}
          </p>
          <p className="font-unfocus text-fg-normal text-base line-clamp-3">
            {stylist.description}
          </p>
        </div>
        <div className="flex gap-sm mt-md">
          <div className="flex-1">
            <FlatIconTextButton
              icon={Pencil}
              text="Bearbeiten"
              onClick={handleEdit}
              elevation={1}
              className="w-full"
            />
          </div>
          <FlatIconButton
            icon={Trash2}
            onClick={handleDelete}
            ariaLabel="Löschen"
            elevation={1}
            isError={true}
          />
        </div>
      </div>
    </div>
  );
}
