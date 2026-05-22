"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";
import Link from "next/link";
import { EventShell } from "../components/event-shell";

export default function GeneratePage() {
  const { password } = useAuth();
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!password) {
    router.replace("/");
    return null;
  }

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseInt(amount, 10);
    if (!parsed || parsed <= 0) {
      setError("Bitte einen positiven Betrag eingeben");
      return;
    }

    const parsedQuantity = parseInt(quantity, 10);
    if (!parsedQuantity || parsedQuantity <= 0) {
      setError("Bitte eine positive Anzahl eingeben");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ amount: parsed, quantity: parsedQuantity }),
      });

      if (res.status === 401) {
        setError("Nicht autorisiert — Passwort prüfen");
        setLoading(false);
        return;
      }

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Gutschein konnte nicht erstellt werden");
        setLoading(false);
        return;
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `gutschein-${parsed}eur-x${parsedQuantity}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setLoading(false);
    } catch {
      setError("Verbindung fehlgeschlagen");
      setLoading(false);
    }
  };

  return (
    <EventShell
      title="Gutscheine"
      subtitle="Erstellen Sie Gutscheine fur das Event und geben Sie sie gesammelt als PDF aus."
      compact
      backHref="/home"
    >
      <form
        className="mx-auto flex w-full max-w-xl flex-col gap-5 rounded-[1.75rem] border-2 border-primary/10 bg-white/92 p-6 shadow-[0_18px_40px_rgba(31,44,61,0.12)] sm:p-8"
        onSubmit={handleGenerate}
      >
        <div className="space-y-2 text-center">
          <h2 className="text-2xl text-accent sm:text-3xl">
            Gutscheine erzeugen
          </h2>
          <p className="text-base text-accent/75">
            Betrag und Anzahl festlegen, danach wird direkt eine PDF-Datei zum
            Download erzeugt.
          </p>
        </div>
        <input
          type="number"
          placeholder="Betrag in €"
          min={1}
          step={1}
          className="w-full rounded-2xl border-2 border-accent/10 bg-cream px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <input
          type="number"
          placeholder="Anzahl Gutscheine"
          min={1}
          step={1}
          className="w-full rounded-2xl border-2 border-accent/10 bg-cream px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {error ? (
          <p className="rounded-2xl bg-danger/10 px-4 py-3 text-center text-sm text-danger">
            {error}
          </p>
        ) : null}
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(204,0,0,0.28)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "PDF wird erstellt..." : "Gutschein-PDF erstellen"}
        </button>
        <Link
          href="/home"
          className="block text-center text-sm text-accent/65 transition-colors hover:text-primary"
        >
          ← Zurück zur Startseite
        </Link>
      </form>
    </EventShell>
  );
}
