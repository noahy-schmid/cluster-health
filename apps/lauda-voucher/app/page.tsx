"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";
import { EventShell } from "./components/event-shell";
import { FeatureCard } from "./components/feature-card.component";

export default function LoginPage() {
  const { password, setPassword } = useAuth();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  if (password) {
    router.replace("/home");
    return null;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) {
      setError("Bitte Passwort eingeben");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: input,
        },
        body: JSON.stringify({ qrContent: "{}" }),
      });

      if (res.status === 401) {
        setError("Ungültiges Passwort");
        setLoading(false);
        return;
      }

      setPassword(input);
      router.replace("/home");
    } catch {
      setError("Verbindung fehlgeschlagen");
      setLoading(false);
    }
  };

  return (
    <EventShell
      title="Stammheimer Seifenkistenrennen"
      subtitle="Die Event-App bündelt Gutscheine, Teamverwaltung und weitere Abläufe rund um das Rennen an einem Ort."
      compact
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <form
          className="flex flex-col gap-5 rounded-[1.75rem] border-2 border-primary/10 bg-white/90 p-6 shadow-[0_18px_40px_rgba(31,44,61,0.12)] sm:p-8"
          onSubmit={handleSubmit}
        >
          <div className="space-y-2">
            <h2 className="text-2xl text-accent sm:text-3xl">Anmeldung</h2>
            <p className="text-base leading-relaxed text-accent/75">
              Melden Sie sich an, um Gutscheine zu verwalten, Teams zu pflegen
              und den Organisationsteil des Events zu öffnen.
            </p>
          </div>

          <input
            type="password"
            placeholder="Passwort"
            className="w-full rounded-2xl border-2 border-accent/10 bg-cream px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
          {error ? (
            <p className="rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
              {error}
            </p>
          ) : null}
          <button
            type="submit"
            className="rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(204,0,0,0.28)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
            disabled={loading}
          >
            {loading ? "Prüfe Zugang..." : "Event-App öffnen"}
          </button>
        </form>
      </div>
    </EventShell>
  );
}
