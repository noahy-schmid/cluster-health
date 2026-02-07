"use client";

import { useState } from "react";
import Link from "next/link";
import { KeyRound, PlusCircle } from "lucide-react";

export default function OnboardingPage() {
  const [showJoin, setShowJoin] = useState(false);
  const [joinCode, setJoinCode] = useState("");

  return (
    <div className="min-h-screen bg-bg-0 text-fg-normal relative overflow-hidden">
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-100 opacity-50 blur-3xl" />
      <div className="absolute top-40 right-0 h-64 w-64 rounded-full bg-bg-2 opacity-80 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary-200 opacity-40 blur-3xl" />

      <div className="relative z-10 mx-auto max-w-5xl px-lg py-xl md:py-2xl">
        <p className="text-sm uppercase tracking-[0.2em] text-fg-muted">
          Onboarding
        </p>
        <h1 className="mt-sm text-3xl md:text-4xl font-brand text-fg-brand">
          Willkommen bei{" "}
          <div className="text-center inline-block">
            <h1 className="font-bold">
              dein
              <span className="text-primary-600 text-6xl leading-sm ">.</span>
              salon
            </h1>
          </div>
        </h1>
        <p className="mt-md text-base md:text-lg text-fg-muted">
          Sie sind fast startklar. Wahlen Sie aus, ob Sie einem bestehenden
          Salon beitreten oder einen neuen Salon anlegen mochten.
        </p>

        <div className="mt-2xl grid grid-cols-1 gap-lg md:grid-cols-2">
          <div className="rounded-lg border border-border bg-bg-1 p-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-700">
                <KeyRound className="h-[var(--icon-size-lg)] w-[var(--icon-size-lg)]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-fg-strong">
                  Salon beitreten
                </h2>
                <p className="mt-xs text-sm text-fg-muted">
                  Haben Sie einen Einladungscode? Nutzen Sie ihn, um dem Salon
                  Ihres Teams beizutreten.
                </p>
              </div>
            </div>

            <div className="mt-lg">
              {!showJoin && (
                <button
                  type="button"
                  onClick={() => setShowJoin(true)}
                  className="w-full rounded-md bg-primary-500 px-lg py-sm text-fg-inv font-medium hover:bg-primary-600 transition-colors"
                >
                  Code eingeben
                </button>
              )}

              {showJoin && (
                <form
                  className="mt-md flex flex-col gap-md"
                  onSubmit={(event) => event.preventDefault()}
                >
                  <div className="flex flex-col gap-sm">
                    <label
                      htmlFor="joinCode"
                      className="text-sm font-medium text-fg-strong"
                    >
                      Einladungscode
                    </label>
                    <input
                      id="joinCode"
                      name="joinCode"
                      type="text"
                      value={joinCode}
                      onChange={(event) => setJoinCode(event.target.value)}
                      className="px-md py-sm border border-border rounded-md focus:outline-none focus:ring-2 focus:ring-primary-200 bg-bg-0 text-fg-normal"
                      placeholder="CODE-1234"
                    />
                  </div>
                  <button
                    type="submit"
                    className="w-full rounded-md border border-border px-lg py-sm text-fg-normal hover:bg-bg-2 transition-colors"
                  >
                    Beitreten
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowJoin(false)}
                    className="w-full text-sm text-fg-muted hover:text-fg-normal"
                  >
                    Abbrechen
                  </button>
                </form>
              )}
            </div>
          </div>

          <div className="rounded-lg border border-border bg-bg-1 p-lg shadow-sm flex flex-col justify-between">
            <div className="flex items-start gap-md">
              <div className="flex h-12 w-12 items-center justify-center rounded-md bg-primary-100 text-primary-700">
                <PlusCircle className="h-[var(--icon-size-lg)] w-[var(--icon-size-lg)]" />
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold text-fg-strong">
                  Neuen Salon erstellen
                </h2>
                <p className="mt-xs text-sm text-fg-muted">
                  Legen Sie Ihren Salon an und starten Sie mit den ersten
                  Einstellungen.
                </p>
              </div>
            </div>

            <div className="mt-lg">
              <Link
                href="/onboarding/create"
                className="inline-flex w-full items-center justify-center rounded-md bg-primary-500 px-lg py-sm text-fg-inv font-medium hover:bg-primary-600 transition-colors"
              >
                Salon erstellen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
