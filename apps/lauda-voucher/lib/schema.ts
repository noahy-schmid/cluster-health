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
