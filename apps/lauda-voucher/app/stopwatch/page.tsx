"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../lib/auth-context";
import { StopwatchDisplay } from "./stopwatch-display";
import { StopwatchHistory } from "./stopwatch-history";
import { useStopwatch } from "./use-stopwatch";
import { formatDuration } from "./format-duration";

export default function StopwatchPage() {
  const { password } = useAuth();
  const router = useRouter();

  const {
    isRunning,
    isStopped,
    elapsedMs,
    teamLabel,
    teams,
    runs,
    loading,
    pending,
    error,
    start,
    recordLap,
    stop,
    reset,
  } = useStopwatch(password);

  const [selectedTeamId, setSelectedTeamId] = useState("");

  const sortedTeams = useMemo(
    () =>
      [...teams].sort(
        (left, right) => left.startingNumber - right.startingNumber,
      ),
    [teams],
  );

  useEffect(() => {
    if (!password) {
      router.replace("/");
    }
  }, [password, router]);

  if (!password) {
    return null;
  }

  const statusLabel = isRunning ? "Läuft" : isStopped ? "Gestoppt" : "Bereit";

  return (
    <div className="flex h-[100dvh] flex-col gap-3 px-3 py-3 sm:gap-4 sm:px-6 sm:py-4">
      <div className="flex shrink-0 flex-wrap items-center justify-between gap-2">
        <Link
          href="/home"
          className="rounded-2xl border-2 border-primary/15 bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-primary shadow-sm transition-colors hover:border-primary/30 hover:bg-white"
        >
          ← Zurück
        </Link>

        <div className="flex items-center gap-2">
          {teamLabel ? (
            <span className="rounded-full border-2 border-primary/20 bg-primary/5 px-3 py-1 text-sm font-semibold text-primary">
              {teamLabel}
            </span>
          ) : null}
          <span
            className={`rounded-full px-4 py-1 text-xs uppercase tracking-[0.3em] ${
              isRunning
                ? "bg-primary text-white"
                : isStopped
                  ? "bg-accent text-white"
                  : "border-2 border-primary/20 bg-white text-primary"
            }`}
          >
            {statusLabel}
          </span>
        </div>
      </div>

      <div className="shrink-0 rounded-[1.75rem] border-2 border-primary/10 bg-white/92 p-4 shadow-md sm:p-6">
        <div className="flex flex-col items-center gap-4">
          <StopwatchDisplay value={formatDuration(elapsedMs)} />

          {loading ? (
            <p className="text-sm text-accent/60">Synchronisiere…</p>
          ) : null}

          {error ? (
            <p className="w-full rounded-2xl border-2 border-primary/20 bg-primary/5 px-4 py-2 text-center text-sm text-primary">
              {error}
            </p>
          ) : null}

          <div className="flex w-full flex-col gap-3 sm:max-w-lg">
            {!isRunning && !isStopped ? (
              <label className="flex flex-col gap-1 text-sm text-accent">
                <span className="font-semibold">Team auswählen (optional)</span>
                <select
                  value={selectedTeamId}
                  onChange={(event) => setSelectedTeamId(event.target.value)}
                  disabled={pending}
                  className="rounded-2xl border-2 border-primary/20 bg-white px-4 py-3 text-base text-accent focus:border-primary focus:outline-none disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <option value="">
                    {sortedTeams.length === 0
                      ? "Kein Team / keine Teams vorhanden"
                      : "Ohne Team"}
                  </option>
                  {sortedTeams.map((team) => (
                    <option key={team.id} value={team.id}>
                      #{team.startingNumber} {team.teamName}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {isRunning ? (
              <>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => recordLap()}
                  className="rounded-3xl bg-primary px-6 py-20 text-2xl font-bold text-white shadow-[0_14px_34px_rgba(204,0,0,0.22)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-3xl"
                >
                  Zwischenzeit nehmen
                </button>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => stop()}
                  className="rounded-3xl border-4 border-primary px-6 py-16 text-xl font-bold text-accent transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 sm:text-2xl"
                >
                  Stoppuhr beenden
                </button>
              </>
            ) : isStopped ? (
              <button
                type="button"
                disabled={pending}
                onClick={() => reset()}
                className="rounded-3xl border-4 border-primary px-6 py-20 text-2xl font-bold text-accent transition-colors hover:bg-primary/5 disabled:cursor-not-allowed disabled:opacity-40 sm:text-3xl"
              >
                Zurücksetzen
              </button>
            ) : (
              <button
                type="button"
                disabled={pending}
                onClick={() => start(selectedTeamId || undefined)}
                className="rounded-3xl bg-primary px-6 py-20 text-2xl font-bold text-white shadow-[0_14px_34px_rgba(204,0,0,0.22)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 sm:text-3xl"
              >
                Starten
              </button>
            )}
          </div>
        </div>
      </div>

      <StopwatchHistory runs={runs} />
    </div>
  );
}
