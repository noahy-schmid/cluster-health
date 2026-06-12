import { drizzle } from "drizzle-orm/node-postgres";
import { asc, desc, eq, sql } from "drizzle-orm";
import {
  eventTeamsTable,
  type EventTeam,
  stopwatchTable,
  type StopwatchRow,
  stopwatchRunsTable,
  type StopwatchRunRow,
  usedVouchersTable,
} from "./schema";

const DATABASE_URL = process.env.DATABASE_URL;

if (!DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable must be set");
}

let dbInstance: ReturnType<typeof drizzle> | undefined;

function getDb() {
  if (!dbInstance) {
    dbInstance = drizzle(DATABASE_URL as string);
  }
  return dbInstance;
}

let ensureTeamsTablePromise: Promise<void> | undefined;

async function ensureTeamsTable(): Promise<void> {
  if (!ensureTeamsTablePromise) {
    ensureTeamsTablePromise = getDb()
      .execute(
        sql`
        CREATE TABLE IF NOT EXISTS event_teams (
          id uuid PRIMARY KEY,
          team_name text NOT NULL,
          captain_name text NOT NULL,
          starting_number integer NOT NULL UNIQUE,
          created_at timestamptz NOT NULL DEFAULT now()
        )
      `,
      )
      .then(() => undefined)
      .catch((error) => {
        ensureTeamsTablePromise = undefined;
        throw error;
      });
  }

  await ensureTeamsTablePromise;
}

function pickStartingNumber(takenNumbers: number[]): number | null {
  const availableNumbers: number[] = [];

  for (let number = 10; number <= 99; number += 1) {
    if (!takenNumbers.includes(number)) {
      availableNumbers.push(number);
    }
  }

  if (availableNumbers.length === 0) {
    return null;
  }

  const randomIndex = Math.floor(Math.random() * availableNumbers.length);
  return availableNumbers[randomIndex] ?? null;
}

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "23505"
  );
}

export async function isVoucherUsed(id: string): Promise<boolean> {
  const [row] = await getDb()
    .select()
    .from(usedVouchersTable)
    .where(eq(usedVouchersTable.id, id));
  return !!row;
}

export async function markVoucherUsed(
  id: string,
  amount: number,
): Promise<void> {
  await getDb().insert(usedVouchersTable).values({ id, amount });
}

export async function listTeams(): Promise<EventTeam[]> {
  await ensureTeamsTable();

  return getDb()
    .select()
    .from(eventTeamsTable)
    .orderBy(asc(eventTeamsTable.startingNumber));
}

export async function createTeam(
  teamName: string,
  captainName: string,
): Promise<EventTeam> {
  await ensureTeamsTable();

  for (let attempt = 0; attempt < 5; attempt += 1) {
    const takenNumbers = await getDb()
      .select({ startingNumber: eventTeamsTable.startingNumber })
      .from(eventTeamsTable);

    const startingNumber = pickStartingNumber(
      takenNumbers.map((row) => row.startingNumber),
    );

    if (startingNumber === null) {
      throw new Error("Alle zweistelligen Startnummern sind bereits vergeben.");
    }

    try {
      const [team] = await getDb()
        .insert(eventTeamsTable)
        .values({
          id: crypto.randomUUID(),
          teamName,
          captainName,
          startingNumber,
        })
        .returning();

      if (team) {
        return team;
      }
    } catch (error) {
      if (isUniqueViolation(error)) {
        continue;
      }

      throw error;
    }
  }

  throw new Error(
    "Die Startnummer konnte nicht eindeutig vergeben werden. Bitte erneut versuchen.",
  );
}

export async function deleteTeam(id: string): Promise<void> {
  await ensureTeamsTable();

  await getDb().delete(eventTeamsTable).where(eq(eventTeamsTable.id, id));
}

const SHARED_STOPWATCH_ID = "shared";

let ensureStopwatchTablePromise: Promise<void> | undefined;

async function ensureStopwatchTable(): Promise<void> {
  if (!ensureStopwatchTablePromise) {
    ensureStopwatchTablePromise = getDb()
      .execute(
        sql`
        CREATE TABLE IF NOT EXISTS stopwatch (
          id text PRIMARY KEY,
          status text NOT NULL DEFAULT 'idle',
          started_at timestamptz,
          elapsed_ms integer NOT NULL DEFAULT 0,
          team_id uuid,
          team_label text,
          updated_at timestamptz NOT NULL DEFAULT now()
        )
      `,
      )
      .then(() =>
        getDb().execute(
          sql`
          ALTER TABLE stopwatch ADD COLUMN IF NOT EXISTS team_id uuid;
          ALTER TABLE stopwatch ADD COLUMN IF NOT EXISTS team_label text;
        `,
        ),
      )
      .then(() => undefined)
      .catch((error) => {
        ensureStopwatchTablePromise = undefined;
        throw error;
      });
  }

  await ensureStopwatchTablePromise;
}

const MAX_STOPWATCH_RUNS = 50;

let ensureStopwatchRunsTablePromise: Promise<void> | undefined;

async function ensureStopwatchRunsTable(): Promise<void> {
  if (!ensureStopwatchRunsTablePromise) {
    ensureStopwatchRunsTablePromise = getDb()
      .execute(
        sql`
        CREATE TABLE IF NOT EXISTS stopwatch_runs (
          id uuid PRIMARY KEY,
          elapsed_ms integer NOT NULL,
          team_id uuid,
          team_label text,
          stopped_at timestamptz NOT NULL DEFAULT now()
        )
      `,
      )
      .then(() =>
        getDb().execute(
          sql`
          ALTER TABLE stopwatch_runs ADD COLUMN IF NOT EXISTS team_id uuid;
          ALTER TABLE stopwatch_runs ADD COLUMN IF NOT EXISTS team_label text;
        `,
        ),
      )
      .then(() => undefined)
      .catch((error) => {
        ensureStopwatchRunsTablePromise = undefined;
        throw error;
      });
  }

  await ensureStopwatchRunsTablePromise;
}

async function readStopwatchRow(): Promise<StopwatchRow> {
  const [row] = await getDb()
    .select()
    .from(stopwatchTable)
    .where(eq(stopwatchTable.id, SHARED_STOPWATCH_ID));

  if (row) {
    return row;
  }

  const [created] = await getDb()
    .insert(stopwatchTable)
    .values({ id: SHARED_STOPWATCH_ID, status: "idle", elapsedMs: 0 })
    .onConflictDoNothing()
    .returning();

  if (created) {
    return created;
  }

  const [existing] = await getDb()
    .select()
    .from(stopwatchTable)
    .where(eq(stopwatchTable.id, SHARED_STOPWATCH_ID));

  if (!existing) {
    throw new Error("Stoppuhr konnte nicht initialisiert werden.");
  }

  return existing;
}

export async function getStopwatch(): Promise<StopwatchRow> {
  await ensureStopwatchTable();
  return readStopwatchRow();
}

function formatTeamLabel(team: EventTeam): string {
  return `#${team.startingNumber} ${team.teamName}`;
}

export async function startStopwatch(
  teamId: string | null,
): Promise<StopwatchRow> {
  await ensureStopwatchTable();

  let resolvedTeamId: string | null = null;
  let teamLabel: string | null = null;

  if (teamId) {
    const [team] = await getDb()
      .select()
      .from(eventTeamsTable)
      .where(eq(eventTeamsTable.id, teamId));

    if (!team) {
      throw new Error("Das ausgewählte Team wurde nicht gefunden.");
    }

    resolvedTeamId = team.id;
    teamLabel = formatTeamLabel(team);
  }

  const now = new Date();

  const [row] = await getDb()
    .insert(stopwatchTable)
    .values({
      id: SHARED_STOPWATCH_ID,
      status: "running",
      startedAt: now,
      elapsedMs: 0,
      teamId: resolvedTeamId,
      teamLabel,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: stopwatchTable.id,
      set: {
        status: "running",
        startedAt: now,
        elapsedMs: 0,
        teamId: resolvedTeamId,
        teamLabel,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error("Stoppuhr konnte nicht gestartet werden.");
  }

  return row;
}

export async function recordStopwatchLap(): Promise<StopwatchRow> {
  await ensureStopwatchTable();

  const current = await readStopwatchRow();

  if (current.status !== "running" || !current.startedAt) {
    return current;
  }

  const elapsedMs = Math.max(0, Date.now() - current.startedAt.getTime());

  await ensureStopwatchRunsTable();
  await getDb().insert(stopwatchRunsTable).values({
    id: crypto.randomUUID(),
    elapsedMs,
    teamId: current.teamId,
    teamLabel: current.teamLabel,
  });

  return current;
}

export async function stopStopwatch(): Promise<StopwatchRow> {
  await ensureStopwatchTable();

  const current = await readStopwatchRow();

  if (current.status !== "running" || !current.startedAt) {
    return current;
  }

  const elapsedMs = Math.max(0, Date.now() - current.startedAt.getTime());

  const [row] = await getDb()
    .update(stopwatchTable)
    .set({
      status: "stopped",
      startedAt: null,
      elapsedMs,
      updatedAt: new Date(),
    })
    .where(eq(stopwatchTable.id, SHARED_STOPWATCH_ID))
    .returning();

  if (!row) {
    throw new Error("Stoppuhr konnte nicht gestoppt werden.");
  }

  await ensureStopwatchRunsTable();
  await getDb().insert(stopwatchRunsTable).values({
    id: crypto.randomUUID(),
    elapsedMs,
    teamId: current.teamId,
    teamLabel: current.teamLabel,
  });

  return row;
}

export async function resetStopwatch(): Promise<StopwatchRow> {
  await ensureStopwatchTable();

  const now = new Date();

  const [row] = await getDb()
    .insert(stopwatchTable)
    .values({
      id: SHARED_STOPWATCH_ID,
      status: "idle",
      startedAt: null,
      elapsedMs: 0,
      teamId: null,
      teamLabel: null,
      updatedAt: now,
    })
    .onConflictDoUpdate({
      target: stopwatchTable.id,
      set: {
        status: "idle",
        startedAt: null,
        elapsedMs: 0,
        teamId: null,
        teamLabel: null,
        updatedAt: now,
      },
    })
    .returning();

  if (!row) {
    throw new Error("Stoppuhr konnte nicht zurückgesetzt werden.");
  }

  return row;
}

export async function listStopwatchRuns(): Promise<StopwatchRunRow[]> {
  await ensureStopwatchRunsTable();

  return getDb()
    .select()
    .from(stopwatchRunsTable)
    .orderBy(desc(stopwatchRunsTable.stoppedAt))
    .limit(MAX_STOPWATCH_RUNS);
}
