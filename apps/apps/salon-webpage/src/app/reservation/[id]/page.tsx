"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Clock,
  User,
  Mail,
  Phone,
  CheckCircle,
} from "lucide-react";
import { Reservation } from "@/lib/types/reservation";
import {
  getReservation,
  updateReservationUserDetails,
  confirmReservation,
} from "@/lib/services/reservation-service";
import ContactDetailsDisplay from "./contact-details-display";

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showVerificationCode, setShowVerificationCode] = useState(false);
  const [verificationCode, setVerificationCode] = useState("");
  const [isEmailVerified, setIsEmailVerified] = useState(false);

  useEffect(() => {
    const loadReservation = async () => {
      setIsLoading(true);
      try {
        const data = getReservation(reservationId);
        if (data) {
          setReservation(data);
          // Pre-fill if user details already exist
          if (data.userName) setUserName(data.userName);
          if (data.userEmail) setUserEmail(data.userEmail);
          if (data.userPhone) setUserPhone(data.userPhone);
        } else {
          setError("Reservierung nicht gefunden");
        }
      } catch (err) {
        setError("Fehler beim Laden der Reservierung");
      } finally {
        setIsLoading(false);
      }
    };

    loadReservation();
  }, [reservationId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userName || !userEmail || !userPhone) {
      alert("Bitte füllen Sie alle Felder aus.");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = updateReservationUserDetails(reservationId, {
        userEmail,
        userName,
        userPhone,
      });

      if (success) {
        // Show verification code field instead of confirming immediately
        setShowVerificationCode(true);
        // Reload reservation to show updated status
        const updated = getReservation(reservationId);
        if (updated) {
          setReservation(updated);
        }
      } else {
        alert("Fehler beim Speichern der Daten");
      }
    } catch (err) {
      alert("Ein Fehler ist aufgetreten");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      alert("Bitte geben Sie den Bestätigungscode ein.");
      return;
    }

    // For now, accept any code
    setIsEmailVerified(true);
    confirmReservation(reservationId);
    const updated = getReservation(reservationId);
    if (updated) {
      setReservation(updated);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg-light/30 flex items-center justify-center">
        <p className="text-fg text-lg">Reservierung wird geladen...</p>
      </div>
    );
  }

  if (error || !reservation) {
    return (
      <div className="min-h-screen bg-bg-light/30">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-fg hover:text-fg/70 transition mb-6"
          >
            <ArrowLeft size={20} />
            <span>Zurück zur Startseite</span>
          </button>
          <div className="bg-bg rounded-2xl shadow-lg p-8 text-center">
            <p className="text-fg text-xl">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const isConfirmed = reservation.status === "confirmed";

  return (
    <div className="min-h-screen bg-bg-light/30">
      {/* Header */}
      <div className="bg-bg shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <button
            onClick={() => router.push("/")}
            className="flex items-center gap-2 text-fg hover:text-fg/70 transition mb-4"
          >
            <ArrowLeft size={20} />
            <span>Zurück zur Startseite</span>
          </button>
          <h1 className="text-3xl font-bold text-fg">
            {isConfirmed ? "Buchungsbestätigung" : "Reservierung abschließen"}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {isEmailVerified && (
          <div className="bg-green-50 border-2 border-green-500 rounded-2xl p-6 mb-8 flex items-center gap-4">
            <CheckCircle className="text-green-500" size={32} />
            <div>
              <h2 className="text-xl font-bold text-green-800">
                E-Mail bestätigt!
              </h2>
              <p className="text-green-700">
                Ihre Reservierung wurde erfolgreich bestätigt. Sie erhalten in
                Kürze eine Bestätigungs-E-Mail an {reservation.userEmail}
              </p>
            </div>
          </div>
        )}

        {/* Reservation Details */}
        <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8 mb-8">
          <h2 className="text-2xl font-bold text-fg mb-6">
            Reservierungsdetails
          </h2>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <User className="text-fg/60 mt-1" size={20} />
              <div>
                <p className="text-fg/60 text-sm">Spezialist</p>
                <p className="text-fg font-semibold text-lg">
                  {reservation.staffName}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Calendar className="text-fg/60 mt-1" size={20} />
              <div>
                <p className="text-fg/60 text-sm">Datum</p>
                <p className="text-fg font-semibold text-lg">
                  {reservation.date.toLocaleDateString("de-DE", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Clock className="text-fg/60 mt-1" size={20} />
              <div>
                <p className="text-fg/60 text-sm">Uhrzeit & Dauer</p>
                <p className="text-fg font-semibold text-lg">
                  {reservation.time} ({reservation.duration})
                </p>
              </div>
            </div>

            <div className="border-t border-fg/10 pt-4 mt-4">
              <p className="text-fg/60 text-sm">Service</p>
              <p className="text-fg font-semibold text-lg">
                {reservation.service}
              </p>
              <p className="text-fg text-2xl font-bold mt-2">
                {reservation.price}
              </p>
            </div>

            <div className="bg-fg/5 rounded-lg p-3 mt-4">
              <p className="text-fg/60 text-xs">Reservierungs-ID</p>
              <p className="text-fg font-mono text-sm">{reservation.id}</p>
            </div>
          </div>
        </div>

        {/* User Details Form */}
        {!isConfirmed && !showVerificationCode && (
          <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-fg mb-6">
              Ihre Kontaktdaten
            </h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-fg font-semibold mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-fg/20 bg-bg text-fg focus:border-fg outline-none transition"
                  placeholder="Ihr vollständiger Name"
                  required
                />
              </div>

              <div>
                <label className="block text-fg font-semibold mb-2">
                  E-Mail-Adresse *
                </label>
                <input
                  type="email"
                  value={userEmail}
                  onChange={(e) => setUserEmail(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-fg/20 bg-bg text-fg focus:border-fg outline-none transition"
                  placeholder="ihre.email@beispiel.de"
                  required
                />
                <p className="text-fg/60 text-sm mt-1">
                  Sie erhalten einen Bestätigungscode an diese Adresse
                </p>
              </div>

              <div>
                <label className="block text-fg font-semibold mb-2">
                  Telefonnummer *
                </label>
                <input
                  type="tel"
                  value={userPhone}
                  onChange={(e) => setUserPhone(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-fg/20 bg-bg text-fg focus:border-fg outline-none transition"
                  placeholder="+49 123 456789"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-fg text-bg py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
              >
                {isSubmitting
                  ? "Wird gespeichert..."
                  : "Reservierung bestätigen"}
              </button>
            </form>
          </div>
        )}

        {/* Email Verification Code */}
        {!isConfirmed && showVerificationCode && !isEmailVerified && (
          <div className="bg-bg rounded-2xl shadow-lg p-6 md:p-8">
            <h2 className="text-2xl font-bold text-fg mb-6">
              E-Mail bestätigen
            </h2>
            <p className="text-fg/80 mb-6">
              Wir haben einen Bestätigungscode an{" "}
              <span className="font-semibold">{userEmail}</span> gesendet. Bitte
              geben Sie den Code unten ein.
            </p>
            <form onSubmit={handleVerifyCode} className="space-y-6">
              <div>
                <label className="block text-fg font-semibold mb-2">
                  Bestätigungscode *
                </label>
                <input
                  type="text"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value)}
                  className="w-full px-4 py-3 rounded-lg border-2 border-fg/20 bg-bg text-fg focus:border-fg outline-none transition font-mono text-center text-xl tracking-wider"
                  placeholder="XXXXXX"
                  required
                />
                <p className="text-fg/60 text-sm mt-1">
                  Bitte überprüfen Sie auch Ihren Spam-Ordner
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-fg text-bg py-4 rounded-xl font-bold text-lg hover:opacity-90 transition"
              >
                E-Mail bestätigen
              </button>
            </form>
          </div>
        )}

        {isConfirmed && reservation.userName && (
          <ContactDetailsDisplay reservation={reservation} />
        )}
      </div>
    </div>
  );
}
