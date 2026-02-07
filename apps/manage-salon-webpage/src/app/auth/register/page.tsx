"use client";

import { useState } from "react";
import { UserPlus } from "lucide-react";
import Link from "next/link";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [confirmEmail, setConfirmEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
  }>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Client-side validation
    const newErrors: { email?: string; password?: string } = {};
    
    if (email !== confirmEmail) {
      newErrors.email = "E-Mail-Adressen stimmen nicht überein";
    }
    
    if (password !== confirmPassword) {
      newErrors.password = "Passwörter stimmen nicht überein";
    }
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    
    // Clear errors if validation passes
    setErrors({});
    
    // No backend logic yet - just prevent form submission
    console.log("Register form submitted", {
      email,
      password,
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-0 p-md">
      <div className="w-full max-w-md">
        <div className="bg-bg-2 rounded-lg shadow-lg p-xl">
          {/* Header */}
          <div className="text-center mb-xl">
            <div className="flex justify-center mb-md">
              <div className="w-12 h-12 rounded-full bg-primary flex items-center justify-center">
                <UserPlus className="w-6 h-6 text-fg-inv" />
              </div>
            </div>
            <h1 className="text-2xl font-semibold text-fg-strong mb-sm">
              Registrieren
            </h1>
            <p className="text-sm text-fg-muted">
              Erstellen Sie Ihr dein.salon Konto
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
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className="w-full px-md py-sm border border-border rounded-md bg-bg-1 text-fg-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="ihre.email@beispiel.de"
                required
              />
            </div>

            {/* Confirm Email Field */}
            <div>
              <label
                htmlFor="confirmEmail"
                className="block text-sm font-medium text-fg-normal mb-sm"
              >
                E-Mail-Adresse bestätigen
              </label>
              <input
                type="email"
                id="confirmEmail"
                value={confirmEmail}
                onChange={(e) => {
                  setConfirmEmail(e.target.value);
                  if (errors.email) setErrors({ ...errors, email: undefined });
                }}
                className={`w-full px-md py-sm border rounded-md bg-bg-1 text-fg-normal focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                  errors.email
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="ihre.email@beispiel.de"
                required
              />
              {errors.email && (
                <p className="mt-sm text-sm text-red-600">{errors.email}</p>
              )}
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
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                className="w-full px-md py-sm border border-border rounded-md bg-bg-1 text-fg-normal focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-shadow"
                placeholder="••••••••"
                required
              />
            </div>

            {/* Confirm Password Field */}
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium text-fg-normal mb-sm"
              >
                Passwort bestätigen
              </label>
              <input
                type="password"
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (errors.password)
                    setErrors({ ...errors, password: undefined });
                }}
                className={`w-full px-md py-sm border rounded-md bg-bg-1 text-fg-normal focus:outline-none focus:ring-2 focus:border-transparent transition-shadow ${
                  errors.password
                    ? "border-red-500 focus:ring-red-500"
                    : "border-border focus:ring-primary"
                }`}
                placeholder="••••••••"
                required
              />
              {errors.password && (
                <p className="mt-sm text-sm text-red-600">{errors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-bg-2 font-medium py-sm px-md rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Registrieren
            </button>
          </form>

          {/* Footer */}
          <div className="mt-lg text-center text-sm text-fg-muted">
            Haben Sie bereits ein Konto?{" "}
            <Link
              href="/auth/login"
              className="text-primary hover:text-primary-hover font-medium transition-colors"
            >
              Jetzt anmelden
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
