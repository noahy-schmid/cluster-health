"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type StopwatchStatus = "idle" | "running" | "stopped";

export type StopwatchTeam = {
  id: string;
  teamName: string;
  captainName: string;
  startingNumber: number;
};

type StopwatchState = {
  status: StopwatchStatus;
  startedAt: string | null;
  elapsedMs: number;
  teamId: string | null;
  teamLabel: string | null;
  serverNow: number;
};

export type StopwatchRun = {
  id: string;
  elapsedMs: number;
  teamLabel: string | null;
  stoppedAt: string;
};

type StopwatchResponse = {
  state: StopwatchState;
  runs: StopwatchRun[];
};

type Baseline = {
  status: StopwatchStatus;
  elapsedMs: number;
  teamLabel: string | null;
  clientTime: number;
};

export type StopwatchAction = "start" | "lap" | "stop" | "reset";

export type UseStopwatchResult = {
  status: StopwatchStatus;
  isRunning: boolean;
  isStopped: boolean;
  isIdle: boolean;
  elapsedMs: number;
  teamLabel: string | null;
  teams: StopwatchTeam[];
  runs: StopwatchRun[];
  loading: boolean;
  pending: boolean;
  error: string | null;
  start: (teamId?: string) => Promise<void>;
  recordLap: () => Promise<void>;
  stop: () => Promise<void>;
  reset: () => Promise<void>;
};

const POLL_INTERVAL_MS = 500;

export function useStopwatch(password: string | null): UseStopwatchResult {
  const [baseline, setBaseline] = useState<Baseline>({
    status: "idle",
    elapsedMs: 0,
    teamLabel: null,
    clientTime: Date.now(),
  });
  const [displayMs, setDisplayMs] = useState(0);
  const [runs, setRuns] = useState<StopwatchRun[]>([]);
  const [teams, setTeams] = useState<StopwatchTeam[]>([]);
  const [loading, setLoading] = useState(true);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const applyState = useCallback((state: StopwatchState) => {
    const clientTime = Date.now();

    if (state.status === "running" && state.startedAt) {
      const elapsedAtFetch =
        state.serverNow - new Date(state.startedAt).getTime();
      setBaseline({
        status: "running",
        elapsedMs: Math.max(0, elapsedAtFetch),
        teamLabel: state.teamLabel,
        clientTime,
      });
    } else if (state.status === "stopped") {
      setBaseline({
        status: "stopped",
        elapsedMs: state.elapsedMs,
        teamLabel: state.teamLabel,
        clientTime,
      });
    } else {
      setBaseline({
        status: "idle",
        elapsedMs: 0,
        teamLabel: null,
        clientTime,
      });
    }
  }, []);

  const loadState = useCallback(async () => {
    if (!password) {
      return;
    }

    try {
      const response = await fetch("/api/stopwatch", {
        headers: { Authorization: password },
        cache: "no-store",
      });

      if (!response.ok) {
        const data = await response
          .json()
          .catch(() => ({ error: "Stoppuhr konnte nicht geladen werden" }));
        throw new Error(data.error || "Stoppuhr konnte nicht geladen werden");
      }

      const data = (await response.json()) as StopwatchResponse;
      applyState(data.state);
      setRuns(data.runs ?? []);
      setError(null);
    } catch (loadError) {
      setError(
        loadError instanceof Error
          ? loadError.message
          : "Stoppuhr konnte nicht geladen werden",
      );
    } finally {
      setLoading(false);
    }
  }, [applyState, password]);

  const sendAction = useCallback(
    async (action: StopwatchAction, teamId?: string) => {
      if (!password) {
        return;
      }

      try {
        setPending(true);
        setError(null);

        const response = await fetch("/api/stopwatch", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: password,
          },
          body: JSON.stringify({ action, teamId }),
        });

        const data = await response
          .json()
          .catch(() => ({ error: "Aktion fehlgeschlagen" }));

        if (!response.ok) {
          throw new Error(data.error || "Aktion fehlgeschlagen");
        }

        const result = data as StopwatchResponse;
        applyState(result.state);
        setRuns(result.runs ?? []);
      } catch (actionError) {
        setError(
          actionError instanceof Error
            ? actionError.message
            : "Aktion fehlgeschlagen",
        );
      } finally {
        setPending(false);
      }
    },
    [applyState, password],
  );

  useEffect(() => {
    if (!password) {
      return;
    }

    loadState();
    const interval = setInterval(loadState, POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [loadState, password]);

  useEffect(() => {
    if (!password) {
      return;
    }

    let active = true;

    const loadTeams = async () => {
      try {
        const response = await fetch("/api/teams", {
          headers: { Authorization: password },
          cache: "no-store",
        });

        if (!response.ok) {
          return;
        }

        const data = (await response.json()) as { teams: StopwatchTeam[] };
        if (active) {
          setTeams(data.teams ?? []);
        }
      } catch {
        // Team-Liste ist optional für die Stoppuhr-Anzeige.
      }
    };

    loadTeams();
    const interval = setInterval(loadTeams, POLL_INTERVAL_MS * 20);
    return () => {
      active = false;
      clearInterval(interval);
    };
  }, [password]);

  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    if (baseline.status !== "running") {
      setDisplayMs(baseline.status === "stopped" ? baseline.elapsedMs : 0);
      return;
    }

    const tick = () => {
      setDisplayMs(baseline.elapsedMs + (Date.now() - baseline.clientTime));
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
      }
    };
  }, [baseline]);

  const start = useCallback(
    (teamId?: string) => sendAction("start", teamId),
    [sendAction],
  );
  const recordLap = useCallback(() => sendAction("lap"), [sendAction]);
  const stop = useCallback(() => sendAction("stop"), [sendAction]);
  const reset = useCallback(() => sendAction("reset"), [sendAction]);

  return {
    status: baseline.status,
    isRunning: baseline.status === "running",
    isStopped: baseline.status === "stopped",
    isIdle: baseline.status === "idle",
    elapsedMs: displayMs,
    teamLabel: baseline.teamLabel,
    teams,
    runs,
    loading,
    pending,
    error,
    start,
    recordLap,
    stop,
    reset,
  };
}
