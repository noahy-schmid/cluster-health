"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { Html5Qrcode } from "html5-qrcode";
import Link from "next/link";
import { EventShell } from "../components/event-shell";

export default function VerifyPage() {
  const { password } = useAuth();
  const router = useRouter();
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processingRef = useRef(false);
  const scannerElementId = "qr-reader";
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!password) router.replace("/");
  }, [password, router]);

  const stopScanner = useCallback(async () => {
    if (scannerRef.current) {
      try {
        const state = scannerRef.current.getState();
        if (state === 2) {
          await scannerRef.current.stop();
        }
      } catch {
        // scanner may already be stopped
      }
      scannerRef.current = null;
    }
  }, []);

  const startScanner = useCallback(async () => {
    await stopScanner();
    processingRef.current = false;

    await new Promise((r) => setTimeout(r, 100));

    const el = document.getElementById(scannerElementId);
    if (!el) return;

    const scanner = new Html5Qrcode(scannerElementId);
    scannerRef.current = scanner;

    try {
      await scanner.start(
        { facingMode: "environment" },
        { fps: 10, qrbox: { width: 250, height: 250 } },
        async (decodedText) => {
          if (processingRef.current) return;

          try {
            const parsed = JSON.parse(decodedText);
            if (
              typeof parsed.id === "string" &&
              typeof parsed.amount === "number" &&
              typeof parsed.signature === "string"
            ) {
              processingRef.current = true;
              await stopScanner();
              router.push(
                `/verify/result?qr=${encodeURIComponent(decodedText)}`,
              );
            }
          } catch {
            processingRef.current = true;
            await stopScanner();
            router.push("/verify/result?invalid=1");
          }
        },
        () => {},
      );
    } catch {
      throw new Error("Kein Kamerazugriff. Bitte Kameraberechtigung erteilen.");
    }
  }, [stopScanner, router]);

  useEffect(() => {
    if (password) {
      startScanner().catch((err: unknown) => {
        setError(
          err instanceof Error ? err.message : "Ein Fehler ist aufgetreten.",
        );
      });
    }
    return () => {
      stopScanner();
    };
  }, [password, startScanner, stopScanner]);

  if (!password) return null;

  return (
    <EventShell
      title="Scanner"
      subtitle="Prufen Sie Event-Gutscheine direkt vor Ort und leiten Sie danach zum Einlösen weiter."
      compact
      backHref="/home"
    >
      {error ? (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[1.75rem] bg-white/92 p-8 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-danger/10 text-4xl text-danger">
            ✗
          </div>
          <h2 className="text-center text-2xl text-primary">Fehler</h2>
          <p className="text-center text-base text-danger">{error}</p>
          <Link
            href="/home"
            className="block text-center text-sm text-accent/65 transition-colors hover:text-primary"
          >
            ← Zurück zur Startseite
          </Link>
        </div>
      ) : (
        <div className="mx-auto flex w-full max-w-xl flex-col gap-6 rounded-[1.75rem] bg-white/92 p-8 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10">
          <div className="space-y-2 text-center">
            <h2 className="text-2xl text-primary">Gutschein scannen</h2>
            <p className="text-base text-accent/75">
              Richten Sie die Kamera auf den QR-Code des Gutscheins.
            </p>
          </div>
          <div className="overflow-hidden rounded-[1.5rem] border-2 border-primary/10 bg-cream p-4">
            <div id={scannerElementId} />
          </div>
          <Link
            href="/home"
            className="block text-center text-sm text-accent/65 transition-colors hover:text-primary"
          >
            ← Abbrechen
          </Link>
        </div>
      )}
    </EventShell>
  );
}
