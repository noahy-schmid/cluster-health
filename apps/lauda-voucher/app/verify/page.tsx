"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import { Html5Qrcode } from "html5-qrcode";

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
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      {error ? (
        <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
          <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-100 text-4xl text-danger">
            ✗
          </div>
          <h2 className="text-center text-xl font-bold text-primary">Fehler</h2>
          <p className="text-center text-sm text-danger">{error}</p>
          <a
            href="/home"
            className="block text-center text-sm text-gray-500 hover:underline"
          >
            ← Zurück
          </a>
        </div>
      ) : (
        <div className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg">
          <h1 className="text-center text-2xl font-bold text-primary">
            Gutschein scannen
          </h1>
          <p className="text-center text-sm text-gray-500">
            Kamera auf den QR-Code des Gutscheins richten
          </p>
          <div className="w-full max-w-md overflow-hidden rounded-lg">
            <div id={scannerElementId} />
          </div>
          <a
            href="/home"
            className="block text-center text-sm text-gray-500 hover:underline"
          >
            ← Abbrechen
          </a>
        </div>
      )}
    </div>
  );
}
