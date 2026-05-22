import { drizzle } from "drizzle-orm/node-postgres";
import { asc, eq, sql } from "drizzle-orm";
import { eventTeamsTable, type EventTeam, usedVouchersTable } from "./schema";

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
