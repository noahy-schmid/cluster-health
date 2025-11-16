"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

interface StaffCardProps {
  name: string;
  role: string;
  imageSrc: string;
  specialistId: string;
}

export default function StaffCard({
  name,
  role,
  imageSrc,
  specialistId,
}: StaffCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/specialist/${specialistId}`);
  };

  return (
    <div
      className="relative cursor-pointer transition-transform hover:scale-[1.02] w-full pt-16"
      onClick={handleClick}
    >
      {/* Circular profile image - positioned above the card */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 z-10">
        <div className="relative w-32 h-32 md:w-36 md:h-36 rounded-full overflow-hidden shadow-2xl shadow-black/40">
          <Image src={imageSrc} alt={name} fill className="object-cover" />
        </div>
      </div>

      {/* Card */}
      <div className="relative bg-bg rounded-3xl shadow-lg shadow-black/20 overflow-hidden pt-20 pb-6 px-6 inset-shadow-sm inset-shadow-fg/20">
        {/* Content */}
        <div className="relative text-center">
          <h3 className="text-2xl md:text-xl font-bold text-fg">{name}</h3>
          <p className="text-fg/70 mt-2 text-base md:text-sm">{role}</p>
          <button
            type="button"
            className="mt-6 w-full bg-fg text-bg rounded-xl px-6 py-3 md:py-2.5 font-semibold shadow-md shadow-fg/20 hover:shadow-lg transition-all text-lg md:text-base cursor-pointer"
          >
            Termin buchen
          </button>
        </div>
      </div>
    </div>
  );
}
