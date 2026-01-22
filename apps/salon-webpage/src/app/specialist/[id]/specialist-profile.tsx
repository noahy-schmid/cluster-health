"use client";

import Image from "next/image";
import { Star } from "lucide-react";
import { StaffMemberDetailed } from "@/lib/types/staff";

interface SpecialistProfileProps {
  specialist: StaffMemberDetailed;
}

export default function SpecialistProfile({
  specialist,
}: SpecialistProfileProps) {
  return (
    <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8 mb-8">
      <div className="flex flex-col md:flex-row gap-6 md:gap-8">
        {/* Profile Image */}
        <div className="flex-shrink-0">
          <div className="relative w-40 h-40 md:w-48 md:h-48 rounded-full overflow-hidden shadow-xl mx-auto md:mx-0">
            <Image
              src={specialist.imageSrc}
              alt={specialist.name}
              fill
              className="object-cover"
            />
          </div>
        </div>

        {/* Profile Info */}
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-bold text-fg mb-2">
            {specialist.name}
          </h1>
          <p className="text-xl text-fg/70 mb-4">{specialist.role}</p>

          {/* Rating */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-1">
              <Star className="fill-yellow-500 text-yellow-500" size={20} />
              <span className="text-lg font-semibold text-fg">
                {specialist.rating}
              </span>
            </div>
            <span className="text-fg/60">
              ({specialist.reviewCount} Bewertungen)
            </span>
          </div>

          {/* Experience */}
          <div className="mb-4">
            <span className="text-fg/70">Erfahrung: </span>
            <span className="text-fg font-semibold">
              {specialist.experience}
            </span>
          </div>

          {/* Long Description */}
          <p className="text-fg/80 leading-relaxed mb-4">
            {specialist.longDescription}
          </p>

          {/* Specialties */}
          <div>
            <h3 className="text-lg font-semibold text-fg mb-2">
              Spezialgebiete
            </h3>
            <div className="flex flex-wrap gap-2">
              {specialist.specialties.map((specialty, index) => (
                <span
                  key={index}
                  className="bg-fg/10 text-fg px-3 py-1 rounded-full text-sm font-medium"
                >
                  {specialty}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
