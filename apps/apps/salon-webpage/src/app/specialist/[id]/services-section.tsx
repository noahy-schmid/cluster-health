"use client";

import { Clock } from "lucide-react";
import { StaffMemberDetailed } from "@/lib/types/staff";

interface ServicesSectionProps {
  specialist: StaffMemberDetailed;
  selectedService: string | null;
  onServiceSelect: (serviceName: string) => void;
}

export default function ServicesSection({
  specialist,
  selectedService,
  onServiceSelect,
}: ServicesSectionProps) {
  return (
    <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8 mb-8">
      <h2 className="text-2xl font-bold text-fg mb-6">Leistungen</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {specialist.services.map((service, index) => (
          <div
            key={index}
            onClick={() => onServiceSelect(service.name)}
            className={`p-4 rounded-xl border-2 transition-all cursor-pointer ${
              selectedService === service.name
                ? "border-fg bg-fg/5"
                : "border-fg/20 hover:border-fg/40"
            }`}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-lg font-semibold text-fg">{service.name}</h3>
              <span className="text-xl font-bold text-fg">{service.price}</span>
            </div>
            <div className="flex items-center gap-2 text-fg/60">
              <Clock size={16} />
              <span>{service.duration}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
