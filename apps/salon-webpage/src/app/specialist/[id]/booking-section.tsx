"use client";

import { Calendar } from "lucide-react";
import { StaffMemberDetailed, ServiceAvailability } from "@/lib/types/staff";
import { getServiceAvailability } from "@/lib/services/staff-service";
import { createReservation } from "@/lib/services/reservation-service";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import DateChip from "@/components/date-chip";

interface BookingSectionProps {
  specialist: StaffMemberDetailed | null;
  selectedService: string | null;
}

export default function BookingSection({
  specialist,
  selectedService,
}: BookingSectionProps) {
  const router = useRouter();
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [availability, setAvailability] = useState<ServiceAvailability[]>([]);
  const [isLoadingAvailability, setIsLoadingAvailability] = useState(false);
  const [isCreatingReservation, setIsCreatingReservation] = useState(false);

  // Load availability when service is selected
  useEffect(() => {
    if (!specialist || !selectedService) {
      setAvailability([]);
      setSelectedDay(null);
      setSelectedTime(null);
      return;
    }

    const loadAvailability = async () => {
      setIsLoadingAvailability(true);
      const availabilityData = await getServiceAvailability(
        specialist.id,
        selectedService
      );
      setAvailability(availabilityData || []);
      setSelectedDay(null);
      setSelectedTime(null);
      setIsLoadingAvailability(false);
    };

    loadAvailability();
  }, [selectedService, specialist]);

  const handleBooking = async () => {
    if (!selectedService || !selectedDay || !selectedTime || !specialist) {
      alert("Bitte wählen Sie einen Service, Tag und Uhrzeit aus.");
      return;
    }

    setIsCreatingReservation(true);

    try {
      const selectedServiceData = specialist.services.find(
        (s) => s.name === selectedService
      );

      if (!selectedServiceData) {
        alert("Service nicht gefunden");
        return;
      }

      const reservationId = await createReservation({
        staffId: specialist.id,
        staffName: specialist.name,
        service: selectedService,
        date: selectedDay,
        time: selectedTime,
        price: selectedServiceData.price,
        duration: selectedServiceData.duration,
      });

      // Redirect to reservation page
      router.push(`/reservation/${reservationId}`);
    } catch (error) {
      alert(
        "Fehler beim Erstellen der Reservierung. Bitte versuchen Sie es erneut."
      );
      setIsCreatingReservation(false);
    }
  };

  if (!specialist) {
    return null;
  }

  const selectedServiceData = specialist.services.find(
    (s) => s.name === selectedService
  );

  return (
    <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-fg mb-6 flex items-center gap-2">
        <Calendar size={28} />
        Termin buchen
      </h2>

      {!selectedService && (
        <p className="text-fg/60 text-center py-8">
          Bitte wählen Sie zuerst einen Service aus, um verfügbare Termine zu
          sehen.
        </p>
      )}

      {selectedService && isLoadingAvailability && (
        <p className="text-fg/60 text-center py-8">
          Verfügbarkeit wird geladen...
        </p>
      )}

      {selectedService &&
        !isLoadingAvailability &&
        availability.length === 0 && (
          <p className="text-fg/60 text-center py-8">
            Keine Verfügbarkeit für diesen Service gefunden.
          </p>
        )}

      {selectedService && !isLoadingAvailability && availability.length > 0 && (
        <>
          {/* Day Selection */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-fg mb-3">Tag wählen</h3>
            <div className="flex flex-wrap gap-3">
              {availability.map((avail, index) => (
                <DateChip
                  key={index}
                  date={avail.date}
                  isSelected={selectedDay?.getTime() === avail.date.getTime()}
                  onClick={() => {
                    setSelectedDay(avail.date);
                    setSelectedTime(null); // Reset time when day changes
                  }}
                />
              ))}
            </div>
          </div>

          {/* Time Selection */}
          {selectedDay && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-fg mb-3">
                Uhrzeit wählen
              </h3>
              <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                {availability
                  .find((a) => a.date.getTime() === selectedDay.getTime())
                  ?.times.map((time, index) => (
                    <button
                      key={index}
                      onClick={() => setSelectedTime(time)}
                      className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        selectedTime === time
                          ? "bg-fg text-bg"
                          : "bg-fg/10 text-fg hover:bg-fg/20"
                      }`}
                    >
                      {time}
                    </button>
                  ))}
              </div>
            </div>
          )}

          {/* Book Button */}
          <button
            onClick={handleBooking}
            disabled={
              !selectedService ||
              !selectedDay ||
              !selectedTime ||
              isCreatingReservation
            }
            className={`w-full py-4 rounded-xl font-bold text-lg transition-all ${
              selectedService &&
              selectedDay &&
              selectedTime &&
              !isCreatingReservation
                ? "bg-fg text-bg hover:opacity-90 shadow-lg cursor-pointer"
                : "bg-fg/20 text-fg/40 cursor-not-allowed"
            }`}
          >
            {isCreatingReservation
              ? "Reservierung wird erstellt..."
              : "Nächster Schritt"}
          </button>
        </>
      )}
    </div>
  );
}
