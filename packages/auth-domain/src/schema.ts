import { time } from "drizzle-orm/pg-core";
import { timestamp } from "drizzle-orm/pg-core";
import { pgSchema } from "drizzle-orm/pg-core";
import { integer, text, uuid, varchar } from "drizzle-orm/pg-core";

export const authSchema = pgSchema("auth");

export const managementUserTable = authSchema.table("management_user", {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  passwordHash: text().notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  passwortUpdatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  salonId: uuid(),
});

export const managementUserRoleTable = authSchema.table(
  "management_user_role",
  {
    userId: uuid()
      .notNull()
      .references(() => managementUserTable.id, { onDelete: "cascade" }),
    roleId: varchar({ length: 255 }).notNull(),
    assignedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    revokedAt: timestamp({ withTimezone: true }),
    assignedBy: uuid(),
  },
);
