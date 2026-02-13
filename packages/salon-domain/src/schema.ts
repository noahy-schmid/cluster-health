import { sql } from "drizzle-orm";
import {
  pgSchema,
  text,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";

export const salonSchema = pgSchema("salon");

export const salonsTable = salonSchema.table(
  "salons",
  {
    id: uuid().primaryKey().defaultRandom(),
    name: varchar({ length: 255 }).notNull(),
    street: varchar({ length: 255 }).notNull(),
    postalCode: varchar({ length: 20 }).notNull(),
    city: varchar({ length: 255 }).notNull(),
    phone: varchar({ length: 40 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    nameUnique: uniqueIndex("salons_name_ci_unique").on(
      sql`lower(${table.name})`,
    ),
  }),
);

export const stylistsTable = salonSchema.table("stylists", {
  id: uuid().primaryKey().defaultRandom(),
  salonId: uuid()
    .notNull()
    .references(() => salonsTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  subtitle: varchar({ length: 255 }).notNull(),
  description: text().notNull(),
  profileImage: varchar({ length: 500 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
