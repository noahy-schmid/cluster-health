"use client";

import { User, Mail, Phone } from "lucide-react";
import { Reservation } from "@/lib/types/reservation";

interface ContactDetailsDisplayProps {
  reservation: Reservation;
}

export default function ContactDetailsDisplay({
  reservation,
}: ContactDetailsDisplayProps) {
  return (
    <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8">
      <h2 className="text-2xl font-bold text-fg mb-6">Ihre Kontaktdaten</h2>
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <User className="text-fg/60" size={20} />
          <div>
            <p className="text-fg/60 text-sm">Name</p>
            <p className="text-fg font-semibold">{reservation.userName}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Mail className="text-fg/60" size={20} />
          <div>
            <p className="text-fg/60 text-sm">E-Mail</p>
            <p className="text-fg font-semibold">{reservation.userEmail}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Phone className="text-fg/60" size={20} />
          <div>
            <p className="text-fg/60 text-sm">Telefon</p>
            <p className="text-fg font-semibold">{reservation.userPhone}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
