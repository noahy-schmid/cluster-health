"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../lib/auth-context";

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
    <div className="flex min-h-screen flex-col items-center justify-center p-6">
      <form
        className="flex w-full max-w-md flex-col gap-6 rounded-lg bg-white p-10 shadow-lg"
        onSubmit={handleSubmit}
      >
        <h1 className="text-center text-2xl font-bold text-primary">
          Gutschein Generator
        </h1>
        <p className="text-center text-sm text-gray-500">
          Bitte Passwort eingeben um fortzufahren
        </p>
        <input
          type="password"
          placeholder="Passwort"
          className="w-full rounded-lg border-2 border-gray-200 px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          autoFocus
        />
        {error && <p className="text-center text-sm text-danger">{error}</p>}
        <button
          type="submit"
          className="w-full rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-md shadow-primary/30 transition-opacity hover:opacity-90 active:scale-[0.97] disabled:cursor-not-allowed disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Prüfe..." : "Anmelden"}
        </button>
      </form>
    </div>
  );
}
