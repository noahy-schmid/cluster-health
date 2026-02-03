import { integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const websitesTable = pgTable("websites", {
  id: uuid().primaryKey().defaultRandom(),
  salonId: uuid().notNull(),
  heroImage: varchar().notNull(),
  logo: varchar().notNull(),
});

export const sectionsTable = pgTable("sections", {
  id: uuid().primaryKey().defaultRandom(),
  websiteId: uuid()
    .notNull()
    .references(() => websitesTable.id, { onDelete: "cascade" }),
  type: varchar().notNull(),
  order: integer().notNull(),
});

export const textWithImageSectionsTable = pgTable("text_with_image_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  content: text().notNull(),
  image: varchar().notNull(),
});
