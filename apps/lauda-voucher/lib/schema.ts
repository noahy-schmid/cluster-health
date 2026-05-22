import { pgTable, text, integer, timestamp, uuid } from "drizzle-orm/pg-core";

export const usedVouchersTable = pgTable("used_vouchers", {
  id: uuid().primaryKey(),
  amount: integer().notNull(),
  usedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});
