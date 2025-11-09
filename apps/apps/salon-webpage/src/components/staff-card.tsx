"use client";

import Image from "next/image";

interface StaffCardProps {
  name: string;
  role: string;
  imageSrc: string;
  onClick: () => void;
}

export default function StaffCard({
  name,
  role,
  imageSrc,
  onClick,
}: StaffCardProps) {
  return (
    <div
      className="bg-bg rounded-xl shadow-lg shadow-black/20 overflow-hidden cursor-pointer transition-transform hover:scale-[1.02] w-full"
      onClick={onClick}
    >
      <div className="relative w-full h-80 md:h-72 bg-bg-light">
        <Image src={imageSrc} alt={name} fill className="object-cover" />
      </div>
      <div className="p-6 md:p-4 text-center">
        <h3 className="text-2xl md:text-xl font-semibold text-fg">{name}</h3>
        <p className="text-fg/70 mt-1 text-lg md:text-base">{role}</p>
        <button
          type="button"
          className="mt-6 md:mt-4 w-full bg-fg text-bg rounded-lg px-4 py-3 md:py-2 font-semibold shadow-md hover:opacity-90 transition text-lg md:text-base"
        >
          Termin buchen
        </button>
      </div>
    </div>
  );
}
