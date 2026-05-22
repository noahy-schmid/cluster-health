"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../../../lib/auth-context";

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
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      {view.type === "loading" && (
        <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
          <h2 className="text-center text-xl font-bold text-primary">
            Wird geprüft...
          </h2>
        </div>
      )}

      {view.type === "result" && (
        <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
          <h2 className="text-center text-xl font-bold text-primary">
            Gutschein Ergebnis
          </h2>

          {!view.result.valid ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-danger">
                ✗
              </div>
              <p className="text-center text-sm text-danger">
                Ungültige Gutschein-Signatur
              </p>
            </>
          ) : view.result.used ? (
            <>
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-4xl text-amber-500">
                !
              </div>
              <p className="text-center text-sm text-danger">
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
              <p className="text-center text-sm text-success">
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
                className="w-full rounded-full bg-gray-800 px-6 py-3.5 text-base font-semibold text-white shadow-md transition-opacity hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
                onClick={handleUse}
                disabled={useLoading}
              >
                {useLoading ? "Wird eingelöst..." : "Gutschein einlösen"}
              </button>
            )}
            <button
              className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100"
              onClick={() => router.replace("/verify")}
            >
              ← Zurück zum Scanner
            </button>
          </div>
        </div>
      )}

      {view.type === "used-success" && (
        <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-4xl text-success">
            ✓
          </div>
          <h2 className="text-center text-xl font-bold text-primary">
            Gutschein eingelöst!
          </h2>
          <p className="text-center text-sm text-success">
            Zurück zum Scanner...
          </p>
        </div>
      )}

      {view.type === "error" && (
        <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-danger">
            ✗
          </div>
          <h2 className="text-center text-xl font-bold text-primary">Fehler</h2>
          <p className="text-center text-sm text-danger">{view.message}</p>
          <button
            className="w-full rounded-lg border border-gray-200 bg-transparent px-4 py-2 text-sm text-gray-500 transition-colors hover:bg-gray-100"
            onClick={() => router.replace("/verify")}
          >
            ← Zurück zum Scanner
          </button>
        </div>
      )}
    </div>
  );
}
