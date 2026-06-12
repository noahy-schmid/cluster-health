import { integer, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

export const usedVouchersTable = pgTable("used_vouchers", {
  id: uuid().primaryKey(),
  amount: integer().notNull(),
  usedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const eventTeamsTable = pgTable("event_teams", {
  id: uuid().primaryKey(),
  teamName: text("team_name").notNull(),
  captainName: text("captain_name").notNull(),
  startingNumber: integer("starting_number").notNull().unique(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type EventTeam = typeof eventTeamsTable.$inferSelect;

export const stopwatchTable = pgTable("stopwatch", {
  id: text().primaryKey(),
  status: text().notNull().default("idle"),
  startedAt: timestamp("started_at", { withTimezone: true }),
  elapsedMs: integer("elapsed_ms").notNull().default(0),
  teamId: uuid("team_id"),
  teamLabel: text("team_label"),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StopwatchRow = typeof stopwatchTable.$inferSelect;

export const stopwatchRunsTable = pgTable("stopwatch_runs", {
  id: uuid().primaryKey(),
  elapsedMs: integer("elapsed_ms").notNull(),
  teamId: uuid("team_id"),
  teamLabel: text("team_label"),
  stoppedAt: timestamp("stopped_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

export type StopwatchRunRow = typeof stopwatchRunsTable.$inferSelect;
