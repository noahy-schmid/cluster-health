"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, LoaderCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { useStaffStore } from "@/lib/store/staff-store";
import { getStaffMemberById } from "@/lib/services/staff-service";
import { StaffMemberDetailed } from "@/lib/types/staff";
import SpecialistProfile from "./specialist-profile";
import ServicesSection from "./services-section";
import BookingSection from "./booking-section";

export default function SpecialistPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [specialist, setSpecialist] = useState<StaffMemberDetailed | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);

  const { getStaffById, setDetailedStaff } = useStaffStore();

  // Load specialist data
  useEffect(() => {
    async function loadSpecialist() {
      setIsLoading(true);

      // First check if we have it in the store
      let staffMember = getStaffById(id);

      // If not in store, fetch from service
      if (!staffMember) {
        staffMember = await getStaffMemberById(id);
        if (staffMember) {
          setDetailedStaff(id, staffMember);
        }
      }

      setSpecialist(staffMember);
      setIsLoading(false);
    }

    loadSpecialist();
  }, [id, getStaffById, setDetailedStaff]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="flex flex-col items-center">
          <LoaderCircle className="animate-spin" size={48} />
          <p className="text-fg text-lg">Laden...</p>
        </div>
      </div>
    );
  }

  if (!specialist) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-bg">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-fg mb-4">
            Specialist nicht gefunden
          </h1>
          <button
            onClick={() => router.push("/")}
            className="bg-fg text-bg px-6 py-3 rounded-lg font-semibold hover:opacity-90 transition"
          >
            Zurück zur Startseite
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <div className="bg-bg shadow-lg sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-fg hover:text-fg/70 transition"
          >
            <ArrowLeft size={20} />
            <span>Zurück</span>
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        <SpecialistProfile specialist={specialist} />
        <ServicesSection
          specialist={specialist}
          selectedService={selectedService}
          onServiceSelect={setSelectedService}
        />
        <BookingSection
          specialist={specialist}
          selectedService={selectedService}
        />
      </div>
    </div>
  );
}
