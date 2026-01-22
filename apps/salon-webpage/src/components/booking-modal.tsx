"use client";

import { X } from "lucide-react";
import Image from "next/image";
import { useEffect } from "react";

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffMember: {
    name: string;
    role: string;
    imageSrc: string;
    description: string;
  };
}

export default function BookingModal({
  isOpen,
  onClose,
  staffMember,
}: BookingModalProps) {
  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-bg rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 bg-bg-dark/80 rounded-full p-2 hover:bg-bg-dark transition"
        >
          <X size={24} className="text-fg" />
        </button>

        {/* Staff Member Info */}
        <div className="p-6 md:p-8">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="relative w-full md:w-48 h-64 rounded-lg overflow-hidden bg-bg-light flex-shrink-0">
              <Image
                src={staffMember.imageSrc}
                alt={staffMember.name}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-fg">{staffMember.name}</h2>
              <p className="text-fg/70 text-lg mt-1">{staffMember.role}</p>
              <p className="text-fg/80 mt-4 leading-relaxed">
                {staffMember.description}
              </p>
            </div>
          </div>

          {/* Booking Form */}
          <div className="mt-8 pt-6 border-t border-fg/10">
            <h3 className="text-xl font-semibold text-fg mb-4">
              Termin buchen
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="text"
                placeholder="Name *"
                className="bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg inset-shadow-sm inset-shadow-bg-dark/20"
              />
              <input
                type="email"
                placeholder="E-Mail *"
                className="bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg inset-shadow-sm inset-shadow-bg-dark/20"
              />
              <input
                type="tel"
                placeholder="Telefon *"
                className="bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg inset-shadow-sm inset-shadow-bg-dark/20"
              />
              <input
                type="date"
                placeholder="Wunschtermin"
                className="bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg inset-shadow-sm inset-shadow-bg-dark/20"
              />
              <select className="bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg inset-shadow-sm inset-shadow-bg-dark/20 md:col-span-2">
                <option value="">Service auswählen *</option>
                <option value="schnitt">Haarschnitt</option>
                <option value="farbe">Färben</option>
                <option value="balayage">Balayage</option>
                <option value="dauerwelle">Dauerwelle</option>
                <option value="styling">Styling</option>
                <option value="beratung">Beratung</option>
              </select>
              <textarea
                placeholder="Nachricht / Besondere Wünsche"
                rows={4}
                className="bg-bg-light rounded-lg text-lg p-3 focus:outline-fg text-fg resize-none inset-shadow-sm inset-shadow-bg-dark/20 md:col-span-2"
              ></textarea>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                type="button"
                className="flex-1 bg-fg text-bg rounded-lg px-6 py-3 font-semibold shadow-lg shadow-bg-dark/20 hover:opacity-90 transition inset-shadow-sm inset-shadow-white"
                onClick={() => {
                  alert(`Termin mit ${staffMember.name} wird gebucht`);
                }}
              >
                Termin anfragen
              </button>
              <button
                type="button"
                className="px-6 py-3 bg-bg-light text-fg rounded-lg font-semibold hover:bg-bg-dark transition"
                onClick={onClose}
              >
                Abbrechen
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
