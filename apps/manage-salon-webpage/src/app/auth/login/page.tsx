"use client";

import { useActionState, useState } from "react";
import { loginAction } from "@/api/auth-actions";
import SubmitButton from "@/components/SubmitButton";

export default function LoginPage() {
  const [state, login] = useActionState(loginAction, undefined);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-bg-0 p-md">
      <div className="bg-bg-1 rounded-lg w-[400px] shadow-lg border border-border p-xl">
        {/* Logo */}
        <div className="p-lg text-center">
          <h1 className="font-brand font-bold text-xl text-brand-text">
            dein<span className="text-primary-600 text-4xl">.</span>salon
          </h1>
        </div>

        {/* Login form */}
        <form action={login} className="flex flex-col gap-lg">
          {/* Email field */}
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
            <p className="text-sm text-red-500">
              {state?.success === false && state.errors?.email
                ? state.errors.email.errors.join(" ")
                : "\u00A0"}
            </p>
          </div>

          {/* Password field */}
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
              autoComplete="current-password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
              placeholder="••••••••"
            />
            <p className="text-sm text-red-500">
              {state?.success === false && state.errors?.password
                ? state.errors.password.errors.join(" ")
                : "\u00A0"}
            </p>
          </div>

          {/* Submit button */}
          <div className="pt-md">
            <SubmitButton label="Anmelden" pendingLabel="Anmelden..." />
          </div>
        </form>
      </div>
    </div>
  );
}
