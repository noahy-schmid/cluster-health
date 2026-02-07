"use client";

import { FormEvent, useState } from "react";
import SubmitButton from "@/components/SubmitButton";

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: "",
    confirmEmail: "",
    password: "",
    confirmPassword: "",
  });
  const [confirmEmailTouched, setConfirmEmailTouched] = useState(false);
  const [confirmPasswordTouched, setConfirmPasswordTouched] = useState(false);

  const emailMismatch =
    formData.email.length > 0 &&
    formData.confirmEmail.length > 0 &&
    formData.email !== formData.confirmEmail;
  const passwordMismatch =
    formData.password.length > 0 &&
    formData.confirmPassword.length > 0 &&
    formData.password !== formData.confirmPassword;

  const handleSubmit = async (_data: FormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setConfirmEmailTouched(true);
    setConfirmPasswordTouched(true);
    console.log("Form submitted with data:", formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-0 p-md">
      <div className="bg-bg-1 rounded-lg w-[400px] shadow-lg border border-border p-xl">
        <div className="p-lg text-center">
          <h1 className="font-brand font-bold text-xl text-brand-text">
            dein<span className="text-primary-600 text-4xl">.</span>salon
          </h1>
        </div>

        <form action={handleSubmit} className="flex flex-col gap-lg">
          <div className="flex flex-col gap-sm">
            <label
              htmlFor="email"
              className="text-sm font-normal text-fg-strong"
            >
              E-Mail-Adresse
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
              placeholder="ihre-email@beispiel.de"
            />
            <p className="text-sm text-red-500">{"\u00A0"}</p>
          </div>

          <div className="flex flex-col gap-sm">
            <label
              htmlFor="confirmEmail"
              className="text-sm font-normal text-fg-strong"
            >
              E-Mail-Adresse bestätigen
            </label>
            <input
              id="confirmEmail"
              name="confirmEmail"
              type="email"
              required
              autoComplete="email"
              value={formData.confirmEmail}
              onChange={(e) =>
                setFormData({ ...formData, confirmEmail: e.target.value })
              }
              onBlur={() => setConfirmEmailTouched(true)}
              className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
              placeholder="ihre-email@beispiel.de"
            />
            <p className="text-sm text-red-500">
              {confirmEmailTouched && emailMismatch
                ? "Die E-Mail-Adressen stimmen nicht überein."
                : "\u00A0"}
            </p>
          </div>

          <div className="flex flex-col gap-sm">
            <label
              htmlFor="password"
              className="text-sm font-normal text-fg-strong"
            >
              Passwort
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="new-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
              placeholder="••••••••"
            />
            <p className="text-sm text-red-500">{"\u00A0"}</p>
          </div>

          <div className="flex flex-col gap-sm">
            <label
              htmlFor="confirmPassword"
              className="text-sm font-normal text-fg-strong"
            >
              Passwort bestätigen
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  confirmPassword: e.target.value,
                })
              }
              onBlur={() => setConfirmPasswordTouched(true)}
              className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
              placeholder="••••••••"
            />
            <p className="text-sm text-red-500">
              {confirmPasswordTouched && passwordMismatch
                ? "Die Passwörter stimmen nicht überein."
                : "\u00A0"}
            </p>
          </div>

          <div className="pt-md">
            <SubmitButton label="Registrieren" pendingLabel="Registrieren..." />
          </div>
        </form>
      </div>
    </div>
  );
}
