"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../lib/auth-context";

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
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <form
        className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg"
        onSubmit={handleGenerate}
      >
        <h1 className="text-center text-2xl font-bold text-primary">
          Gutschein erstellen
        </h1>
        <p className="text-center text-sm text-gray-500">
          Gutscheinbetrag und Anzahl eingeben
        </p>
        <input
          type="number"
          placeholder="Betrag in €"
          min={1}
          step={1}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          autoFocus
        />
        <input
          type="number"
          placeholder="Anzahl Gutscheine"
          min={1}
          step={1}
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
        />
        {error && <p className="text-center text-sm text-danger">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-primary/30 transition-opacity hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Wird erstellt..." : "PDF erstellen"}
        </button>
        <a
          href="/home"
          className="block text-center text-sm text-gray-500 hover:underline"
        >
          ← Zurück
        </a>
      </form>
    </div>
  );
}
