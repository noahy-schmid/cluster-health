import { NextRequest, NextResponse } from "next/server";
import { authenticate } from "../../../lib/auth";
import {
  getStopwatch,
  listStopwatchRuns,
  recordStopwatchLap,
  resetStopwatch,
  startStopwatch,
  stopStopwatch,
} from "../../../lib/db";
import type { StopwatchRow, StopwatchRunRow } from "../../../lib/schema";

type StopwatchState = {
  status: StopwatchRow["status"];
  startedAt: string | null;
  elapsedMs: number;
  teamId: string | null;
  teamLabel: string | null;
  serverNow: number;
};

type StopwatchRunDto = {
  id: string;
  elapsedMs: number;
  teamLabel: string | null;
  stoppedAt: string;
};

function serializeState(row: StopwatchRow): StopwatchState {
  return {
    status: row.status,
    startedAt: row.startedAt ? row.startedAt.toISOString() : null,
    elapsedMs: row.elapsedMs,
    teamId: row.teamId,
    teamLabel: row.teamLabel,
    serverNow: Date.now(),
  };
}

function serializeRun(run: StopwatchRunRow): StopwatchRunDto {
  return {
    id: run.id,
    elapsedMs: run.elapsedMs,
    teamLabel: run.teamLabel,
    stoppedAt: run.stoppedAt.toISOString(),
  };
}

export async function GET(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  try {
    const [row, runs] = await Promise.all([
      getStopwatch(),
      listStopwatchRuns(),
    ]);
    return NextResponse.json(
      { state: serializeState(row), runs: runs.map(serializeRun) },
      { status: 200 },
    );
  } catch {
    return NextResponse.json(
      { error: "Stoppuhr konnte nicht geladen werden." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  const authError = authenticate(request);
  if (authError) return authError;

  let body: { action?: string; teamId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Ungültiger JSON Body" },
      { status: 400 },
    );
  }

  const action = body.action;

  if (
    action !== "start" &&
    action !== "lap" &&
    action !== "stop" &&
    action !== "reset"
  ) {
    return NextResponse.json({ error: "Unbekannte Aktion." }, { status: 400 });
  }

  try {
    let row: StopwatchRow;
    if (action === "start") {
      const teamId = body.teamId?.trim();
      row = await startStopwatch(teamId || null);
    } else if (action === "lap") {
      row = await recordStopwatchLap();
    } else if (action === "stop") {
      row = await stopStopwatch();
    } else {
      row = await resetStopwatch();
    }

    const runs = await listStopwatchRuns();

    return NextResponse.json(
      { state: serializeState(row), runs: runs.map(serializeRun) },
      { status: 200 },
    );
  } catch (error) {
    const message =
      error instanceof Error
        ? error.message
        : "Stoppuhr konnte nicht aktualisiert werden.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
