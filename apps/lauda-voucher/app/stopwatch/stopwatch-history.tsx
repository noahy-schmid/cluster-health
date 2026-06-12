"use client";

import { formatDuration } from "./format-duration";
import type { StopwatchRun } from "./use-stopwatch";

const timeFormatter = new Intl.DateTimeFormat("de-DE", {
  day: "2-digit",
  month: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
});

export function StopwatchHistory({ runs }: { runs: StopwatchRun[] }) {
  return (
    <div className="flex min-h-0 flex-1 flex-col rounded-[1.75rem] border-2 border-primary/10 bg-white/92 p-6 shadow-md sm:p-8">
      <div className="flex shrink-0 items-center justify-between gap-4">
        <h2 className="text-lg font-semibold text-accent">Vorherige Läufe</h2>
      </div>

      {runs.length === 0 ? (
        <p className="mt-4 text-sm text-accent/60">
          Noch keine gestoppten Zeiten vorhanden.
        </p>
      ) : (
        <ol className="mt-4 flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto">
          {runs.map((run, index) => (
            <li
              key={run.id}
              className="flex items-center justify-between gap-4 rounded-2xl border-2 border-primary/10 bg-white px-4 py-3"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                  {runs.length - index}
                </span>
                <span className="flex flex-col">
                  <span className="font-mono text-lg tabular-nums text-accent">
                    {formatDuration(run.elapsedMs)}
                  </span>
                  {run.teamLabel ? (
                    <span className="text-xs font-medium text-primary">
                      {run.teamLabel}
                    </span>
                  ) : null}
                </span>
              </span>

              <span className="text-xs text-accent/60">
                {timeFormatter.format(new Date(run.stoppedAt))}
              </span>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
