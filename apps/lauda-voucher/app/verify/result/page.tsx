"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";
import { EventShell } from "../../components/event-shell";

interface VerifyResult {
  valid: boolean;
  amount: number;
  used: boolean;
}

type ViewState =
  | { type: "loading" }
  | { type: "result"; result: VerifyResult }
  | { type: "used-success" }
  | { type: "error"; message: string };

export default function VerifyResultPage() {
  const { password } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const qrContent = searchParams.get("qr");
  const isInvalidQr = searchParams.get("invalid") === "1";
  const [view, setView] = useState<ViewState>(
    isInvalidQr
      ? { type: "error", message: "Ungültiger QR-Code" }
      : { type: "loading" },
  );
  const [useLoading, setUseLoading] = useState(false);

  useEffect(() => {
    if (!password) {
      router.replace("/");
      return;
    }
    if (!qrContent && !isInvalidQr) {
      router.replace("/verify");
    }
  }, [password, qrContent, isInvalidQr, router]);

  const verifyQr = useCallback(async () => {
    if (!qrContent || !password || isInvalidQr) return;

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ qrContent }),
      });

      const data = await res.json();
      setView({ type: "result", result: data });
    } catch {
      setView({ type: "error", message: "Verifizierung fehlgeschlagen" });
    }
  }, [qrContent, password, isInvalidQr]);

  useEffect(() => {
    verifyQr();
  }, [verifyQr]);

  const handleUse = async () => {
    if (!qrContent || !password) return;
    setUseLoading(true);
    try {
      const res = await fetch("/api/use", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ qrContent }),
      });

      if (res.ok) {
        setView({ type: "used-success" });
        setTimeout(() => {
          router.replace("/verify");
        }, 1500);
      } else {
        const data = await res.json();
        setView({
          type: "error",
          message: data.error || "Gutschein konnte nicht eingelöst werden",
        });
      }
    } catch {
      setView({ type: "error", message: "Verbindung fehlgeschlagen" });
    } finally {
      setUseLoading(false);
    }
  };

  if (!password || (!qrContent && !isInvalidQr)) return null;

  return (
    <EventShell
      title="Scanner Ergebnis"
      subtitle="Hier sehen Sie sofort, ob ein Gutschein fur das Event gültig und noch nicht eingelöst ist."
      compact
      backHref="/home"
    >
      {view.type === "loading" && (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[1.75rem] bg-white/92 p-8 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10">
          <h2 className="text-center text-2xl text-primary">Wird geprüft...</h2>
        </div>
      )}

      {view.type === "result" && (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[1.75rem] bg-white/92 p-8 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10">
          <h2 className="text-center text-2xl text-primary">
            Gutschein Ergebnis
          </h2>

          {!view.result.valid ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-4xl text-danger">
                ✗
              </div>
              <p className="text-center text-base text-danger">
                Ungültige Gutschein-Signatur
              </p>
            </>
          ) : view.result.used ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl text-amber-500">
                !
              </div>
              <p className="text-center text-base text-danger">
                Dieser Gutschein wurde bereits eingelöst
              </p>
              <div className="text-center text-4xl font-bold text-primary">
                €{view.result.amount}
              </div>
            </>
          ) : (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-success">
                ✓
              </div>
              <p className="text-center text-base text-success">
                Gültiger Gutschein
              </p>
              <div className="text-center text-4xl font-bold text-primary">
                €{view.result.amount}
              </div>
            </>
          )}

          <div className="flex flex-col gap-3">
            {view.result.valid && !view.result.used && (
              <button
                className="w-full rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(31,44,61,0.24)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleUse}
                disabled={useLoading}
              >
                {useLoading ? "Wird eingelöst..." : "Gutschein einlösen"}
              </button>
            )}
            <button
              className="w-full rounded-full border-2 border-accent/10 bg-white px-4 py-3 text-sm text-accent/70 transition-colors hover:border-primary/25 hover:text-primary"
              onClick={() => router.replace("/verify")}
            >
              ← Zurück zum Scanner
            </button>
          </div>
        </div>
      )}

      {view.type === "used-success" && (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[1.75rem] bg-white/92 p-8 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-success">
            ✓
          </div>
          <h2 className="text-center text-2xl text-primary">
            Gutschein eingelöst!
          </h2>
          <p className="text-center text-base text-success">
            Zurück zum Scanner...
          </p>
        </div>
      )}

      {view.type === "error" && (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[1.75rem] bg-white/92 p-8 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-4xl text-danger">
            ✗
          </div>
          <h2 className="text-center text-2xl text-primary">Fehler</h2>
          <p className="text-center text-base text-danger">{view.message}</p>
          <button
            className="w-full rounded-full border-2 border-accent/10 bg-white px-4 py-3 text-sm text-accent/70 transition-colors hover:border-primary/25 hover:text-primary"
            onClick={() => router.replace("/verify")}
          >
            ← Zurück zum Scanner
          </button>
        </div>
      )}
    </EventShell>
  );
}
