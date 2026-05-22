"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { EventShell } from "../components/event-shell";
import { useAuth } from "../../lib/auth-context";

type Team = {
  id: string;
  teamName: string;
  captainName: string;
  startingNumber: number;
};

export default function TeamsPage() {
  const { password } = useAuth();
  const router = useRouter();
  const [teams, setTeams] = useState<Team[]>([]);
  const [teamName, setTeamName] = useState("");
  const [captainName, setCaptainName] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sortedTeams = useMemo(
    () =>
      [...teams].sort(
        (left, right) => left.startingNumber - right.startingNumber,
      ),
    [teams],
  );

  const loadTeams = useCallback(async () => {
    if (!password) {
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("/api/teams", {
        headers: {
          Authorization: password,
        },
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Teams konnten nicht geladen werden" }));
        throw new Error(data.error || "Teams konnten nicht geladen werden");
      }

      const data = (await response.json()) as { teams: Team[] };
      setTeams(data.teams);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Teams konnten nicht geladen werden",
      );
    } finally {
      setLoading(false);
    }
  }, [password]);

  useEffect(() => {
    if (!password) {
      router.replace("/");
      return;
    }

    loadTeams();
  }, [loadTeams, password, router]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!password) {
      return;
    }

    const trimmedTeamName = teamName.trim();
    const trimmedCaptainName = captainName.trim();

    if (!trimmedTeamName || !trimmedCaptainName) {
      setError("Bitte Teamname und Kapitän angeben.");
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const response = await fetch("/api/teams", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({
          teamName: trimmedTeamName,
          captainName: trimmedCaptainName,
        }),
      });

      const data = await response
        .json()
        .catch(() => ({ error: "Team konnte nicht angelegt werden" }));

      if (!response.ok) {
        throw new Error(data.error || "Team konnte nicht angelegt werden");
      }

      const createdTeam = data.team as Team;
      setTeams((currentTeams) => [...currentTeams, createdTeam]);
      setTeamName("");
      setCaptainName("");
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Team konnte nicht angelegt werden",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (teamId: string) => {
    if (!password) {
      return;
    }

    try {
      setError(null);

      const response = await fetch("/api/teams", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: password,
        },
        body: JSON.stringify({ id: teamId }),
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Team konnte nicht entfernt werden" }));
        throw new Error(data.error || "Team konnte nicht entfernt werden");
      }

      setTeams((currentTeams) =>
        currentTeams.filter((team) => team.id !== teamId),
      );
    } catch (deleteError) {
      setError(
        deleteError instanceof Error
          ? deleteError.message
          : "Team konnte nicht entfernt werden",
      );
    }
  };

  const handleDownloadPdf = async () => {
    if (!password) {
      return;
    }

    try {
      setExporting(true);
      setError(null);

      const response = await fetch("/api/teams/pdf", {
        headers: {
          Authorization: password,
        },
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "PDF konnte nicht erstellt werden" }));
        throw new Error(data.error || "PDF konnte nicht erstellt werden");
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "team-startnummern.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (downloadError) {
      setError(
        downloadError instanceof Error
          ? downloadError.message
          : "PDF konnte nicht erstellt werden",
      );
    } finally {
      setExporting(false);
    }
  };

  if (!password) {
    return null;
  }

  return (
    <EventShell
      title="Teams"
      subtitle="Erfassen Sie alle Rennteams, vergeben Sie eindeutige zweistellige Startnummern und exportieren Sie die Beschilderung gesammelt als PDF."
      backHref="/home"
    >
      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="flex flex-col gap-4">
          <form
            className="rounded-[1.75rem] bg-white/92 p-6 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10 sm:p-8"
            onSubmit={handleSubmit}
          >
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
                Neuer Eintrag
              </p>
              <h2 className="text-2xl text-accent">Team anlegen</h2>
              <p className="text-base leading-relaxed text-accent/75">
                Nach dem Speichern wird automatisch eine freie zweistellige
                Startnummer vergeben.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <input
                type="text"
                placeholder="Teamname"
                className="w-full rounded-2xl border-2 border-accent/10 bg-cream px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
                value={teamName}
                onChange={(event) => setTeamName(event.target.value)}
              />
              <input
                type="text"
                placeholder="Kapitän"
                className="w-full rounded-2xl border-2 border-accent/10 bg-cream px-4 py-3.5 text-base outline-none transition-colors focus:border-primary"
                value={captainName}
                onChange={(event) => setCaptainName(event.target.value)}
              />
            </div>

            {error ? (
              <p className="mt-4 rounded-2xl bg-danger/10 px-4 py-3 text-sm text-danger">
                {error}
              </p>
            ) : null}

            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
              <button
                type="submit"
                className="flex-1 rounded-full bg-primary px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(204,0,0,0.28)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                disabled={submitting}
              >
                {submitting ? "Team wird angelegt..." : "Team speichern"}
              </button>
              <button
                type="button"
                className="rounded-full bg-accent px-6 py-3.5 text-base font-semibold text-white shadow-[0_10px_24px_rgba(31,44,61,0.24)] transition-transform hover:-translate-y-0.5 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={handleDownloadPdf}
                disabled={exporting || sortedTeams.length === 0}
              >
                {exporting ? "PDF wird erstellt..." : "Startnummern-PDF"}
              </button>
            </div>
          </form>

          <div className="rounded-[1.75rem] bg-accent px-6 py-7 text-white shadow-[0_18px_40px_rgba(31,44,61,0.18)]">
            <p className="text-xs uppercase tracking-[0.28em] text-white/70">
              Nächster Schritt
            </p>
            <h2 className="mt-3 text-2xl text-white">Rennzeiten folgen</h2>
            <p className="mt-3 text-base leading-relaxed text-white/82">
              Diese Teamdaten bilden die Grundlage, um im nächsten Ausbau die
              Rennzeiten pro Team sauber zuordnen und auswerten zu können.
            </p>
          </div>

          <Link
            href="/home"
            className="text-center text-sm text-accent/65 transition-colors hover:text-primary"
          >
            ← Zurück zur Startseite
          </Link>
        </div>

        <section className="rounded-[1.75rem] bg-white/92 p-6 shadow-[0_18px_40px_rgba(31,44,61,0.12)] ring-1 ring-primary/10 sm:p-8">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.28em] text-primary/70">
                Übersicht
              </p>
              <h2 className="mt-2 text-2xl text-accent">Gemeldete Teams</h2>
            </div>
            <p className="text-sm text-accent/65">
              {sortedTeams.length} {sortedTeams.length === 1 ? "Team" : "Teams"}
            </p>
          </div>

          {loading ? (
            <div className="mt-6 rounded-[1.5rem] bg-cream px-5 py-8 text-center text-accent/70">
              Teams werden geladen...
            </div>
          ) : sortedTeams.length === 0 ? (
            <div className="mt-6 rounded-[1.5rem] bg-cream px-5 py-8 text-center text-accent/70">
              Noch keine Teams vorhanden. Legen Sie links das erste Team an.
            </div>
          ) : (
            <div className="mt-6 grid gap-4">
              {sortedTeams.map((team) => (
                <article
                  key={team.id}
                  className="grid gap-4 rounded-[1.5rem] border-2 border-primary/10 bg-white p-5 shadow-[0_12px_30px_rgba(31,44,61,0.08)] sm:grid-cols-[auto_1fr_auto] sm:items-center"
                >
                  <div className="flex h-20 w-20 items-center justify-center rounded-[1.25rem] bg-primary text-4xl text-white shadow-[0_10px_24px_rgba(204,0,0,0.22)]">
                    {team.startingNumber}
                  </div>
                  <div>
                    <h3 className="text-xl text-accent">{team.teamName}</h3>
                    <p className="mt-2 text-base text-accent/70">
                      Kapitän: {team.captainName}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="rounded-full border-2 border-danger/20 px-4 py-2 text-sm text-danger transition-colors hover:bg-danger/10"
                    onClick={() => handleDelete(team.id)}
                  >
                    Entfernen
                  </button>
                </article>
              ))}
            </div>
          )}
        </section>
      </div>
    </EventShell>
  );
}
