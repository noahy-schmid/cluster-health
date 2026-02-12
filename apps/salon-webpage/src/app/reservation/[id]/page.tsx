"use client";

import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Calendar, Clock, User, CheckCircle } from "lucide-react";
import { Reservation } from "@/lib/types/reservation";
import {
  getReservation,
  updateReservationUserDetails,
  confirmReservation,
} from "@/lib/services/reservation-service";
import FormField from "@/components/form-field";
import { motion, AnimatePresence } from "framer-motion";
import { useRef } from "react";

// State machine based on LikeC4 model: reservationPageStateMachine
type PageState =
  | "initial"
  | "submittingContactInfo"
  | "showVerificationCode"
  | "submittingVerificationCode"
  | "confirmed";

export default function ReservationPage() {
  const params = useParams();
  const router = useRouter();
  const reservationId = params.id as string;

  const [reservation, setReservation] = useState<Reservation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Page state machine
  const [pageState, setPageState] = useState<PageState>("initial");

  // Form state
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // Ref for verification section to scroll to
  const verificationSectionRef = useRef<HTMLDivElement>(null);

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
      } catch (_err) {
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

    // Transition: initial -> submittingContactInfo
    setPageState("submittingContactInfo");

    try {
      const success = await updateReservationUserDetails(reservationId, {
        userEmail,
        userName,
        userPhone,
      });

      if (success) {
        // Transition: submittingContactInfo -> showVerificationCode
        setPageState("showVerificationCode");
        // Reload reservation to show updated status
        const updated = getReservation(reservationId);
        if (updated) {
          setReservation(updated);
        }
        // Scroll to verification section after animation starts
        setTimeout(() => {
          verificationSectionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 200);
      } else {
        alert("Fehler beim Speichern der Daten");
        setPageState("initial");
      }
    } catch (_err) {
      alert("Ein Fehler ist aufgetreten");
      setPageState("initial");
    }
  };

  const handleVerifyCode = (e: React.FormEvent) => {
    e.preventDefault();

    if (!verificationCode) {
      alert("Bitte geben Sie den Bestätigungscode ein.");
      return;
    }

    // Transition: showVerificationCode -> submittingVerificationCode
    setPageState("submittingVerificationCode");

    // Simulate verification (in real app, this would be async)
    setTimeout(() => {
      // For now, accept any code
      const isValid = true; // In real app: verify code with backend

      if (isValid) {
        // Transition: submittingVerificationCode -> confirmed
        setPageState("confirmed");
        confirmReservation(reservationId);
        const updated = getReservation(reservationId);
        if (updated) {
          setReservation(updated);
        }
      } else {
        // Transition: submittingVerificationCode -> showVerificationCode (failed)
        setPageState("showVerificationCode");
        alert("Ungültiger Code. Bitte versuchen Sie es erneut.");
      }
    }, 500);
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
    <div className="min-h-screen bg-bg-dark">
      {/* Header */}
      <div className="bg-bg-layer-5 shadow-lg sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 pb-6 pt-2">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-fg hover:bg-bg-layer-7 hover:shadow hover:shadow-black/20 hover:inset-shadow-xs hover:inset-shadow-fg/20 transition-all duration-200 p-3 rounded-lg"
          >
            <ArrowLeft size={20} />
            <span>Zurück zur vorherigen Seite</span>
          </button>
          <h1 className="text-3xl font-bold text-fg">
            {isConfirmed ? "Buchungsbestätigung" : "Reservierung abschließen"}
          </h1>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Reservation Details */}
        <div className="max-w-5xl bg-bg mx-auto rounded-xl mb-10 shadow-lg shadow-black/20 inset-shadow-sm inset-shadow-fg/20 p-4 md:p-8">
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

            <div className="bg-bg-layer-1 inset-shadow-xs inset-shadow-black/20 rounded-lg p-3 mt-4">
              <p className="text-fg/60 text-xs">Reservierungs-ID</p>
              <p className="text-fg font-mono text-sm">{reservation.id}</p>
            </div>
          </div>
        </div>

        {/* User Details Form */}

        <div className="max-w-5xl bg-bg mx-auto rounded-xl my-10 shadow-lg shadow-black/20 inset-shadow-sm inset-shadow-fg/20 p-4 md:p-8">
          <h2 className="text-2xl font-bold text-fg mb-6">Ihre Kontaktdaten</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormField
              label="Name"
              type="text"
              value={userName}
              onChange={setUserName}
              placeholder="Ihr vollständiger Name"
              required
              disabled={pageState !== "initial"}
            />

            <FormField
              label="E-Mail-Adresse"
              type="email"
              value={userEmail}
              onChange={setUserEmail}
              placeholder="ihre.email@beispiel.de"
              required
              helperText="Sie erhalten einen Bestätigungscode an diese Adresse"
              disabled={pageState !== "initial"}
            />

            <FormField
              label="Telefonnummer"
              type="tel"
              value={userPhone}
              onChange={setUserPhone}
              placeholder="+49 123 456789"
              required
              disabled={pageState !== "initial"}
            />

            <AnimatePresence>
              {(pageState === "showVerificationCode" ||
                pageState === "submittingVerificationCode") && (
                <motion.div
                  ref={verificationSectionRef}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: "easeOut" }}
                  className="overflow-hidden"
                >
                  <div className="pt-6">
                    <h3 className="text-lg font-bold text-fg border-t border-fg/20 pt-6">
                      E-Mail bestätigen
                    </h3>
                    <p className="text-fg/80 mb-6">
                      Wir haben einen Bestätigungscode an{" "}
                      <span className="font-semibold">{userEmail}</span>{" "}
                      gesendet. Bitte geben Sie den Code unten ein.
                    </p>
                    <FormField
                      label="Bestätigungscode"
                      type="text"
                      value={verificationCode}
                      onChange={setVerificationCode}
                      placeholder="XXXXXX"
                      required
                      helperText="Bitte überprüfen Sie auch Ihren Spam-Ordner"
                    />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {pageState === "confirmed" && (
              <div className="mt-6 flex items-center gap-3 bg-bg-layer-4 p-4 rounded-lg shadow shadow-black/20 inset-shadow-xs inset-shadow-fg/20">
                <CheckCircle className="text-fg" size={24} />
                <p className="text-fg font-semibold">
                  Ihre Reservierung wurde bestätigt! Wir freuen uns, Sie
                  begrüßen zu dürfen.
                </p>
              </div>
            )}

            {pageState !== "confirmed" && (
              <button
                type="submit"
                disabled={
                  pageState !== "initial" &&
                  pageState !== "showVerificationCode"
                }
                className="w-full bg-fg text-bg py-4 rounded-xl font-bold text-lg hover:opacity-90 transition disabled:opacity-50"
                onClick={
                  pageState === "showVerificationCode" ||
                  pageState === "submittingVerificationCode"
                    ? handleVerifyCode
                    : handleSubmit
                }
              >
                {(() => {
                  switch (pageState) {
                    case "submittingContactInfo":
                      return "Wird gespeichert...";
                    case "submittingVerificationCode":
                      return "Wird überprüft...";
                    case "showVerificationCode":
                      return "E-Mail bestätigen";
                    case "initial":
                    default:
                      return "Reservierung abschließen";
                  }
                })()}
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
