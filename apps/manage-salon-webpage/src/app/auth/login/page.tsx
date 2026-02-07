"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend logic yet - just prevent form submission
    console.log("Login form submitted with email:", email);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-0 p-md">
      <div className="w-full max-w-md">
        <div className="bg-bg-2 rounded-lg shadow-lg p-xl">
          {/* Header */}
          <div className="text-center mb-xl">
            <div className="flex justify-center mb-md">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <LogIn className="w-6 h-6 text-fg-inv" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-fg-strong mb-sm">
              Anmelden
            </h1>
            <p className="text-sm text-fg-muted">
              Melden Sie sich bei Ihrem Konto an
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-lg">
            {/* Email Field */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-fg-normal mb-sm"
              >
                E-Mail-Adresse
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-md py-sm border border-border rounded-md bg-bg-1 text-fg-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="ihre.email@beispiel.de"
                required
              />
            </div>

            {/* Password Field */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-medium text-fg-normal mb-sm"
              >
                Passwort
              </label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-md py-sm border border-border rounded-md bg-bg-1 text-fg-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-bg-2 font-medium py-sm px-md rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Anmelden
            </button>
          </form>

          {/* Footer */}
          <div className="mt-lg text-center text-sm text-fg-muted">
            Noch kein Konto?{" "}
            <Link
              href="/auth/register"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Jetzt registrieren
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
