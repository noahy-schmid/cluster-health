import { integer, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";

export const websitesTable = pgTable("websites", {
  id: uuid().primaryKey().defaultRandom(),
  salonId: uuid().notNull(),
  heroImage: varchar().notNull(),
  logo: varchar().notNull(),
  title: varchar().notNull(),
  subtitle: varchar().notNull(),
  slug: varchar().notNull().unique(),
  colorBackgroundBase: varchar().notNull(),
  colorBackgroundElevation1: varchar().notNull(),
  colorBackgroundElevation2: varchar().notNull(),
  colorForegroundBase: varchar().notNull(),
  colorForegroundMuted: varchar().notNull(),
  colorForegroundStrong: varchar().notNull(),
  colorAccent: varchar().notNull(),
  colorOnAccent: varchar().notNull(),
});

export const sectionsTable = pgTable("sections", {
  id: uuid().primaryKey().defaultRandom(),
  websiteId: uuid()
    .notNull()
    .references(() => websitesTable.id, { onDelete: "cascade" }),
  type: varchar().notNull(),
  order: integer().notNull(),
  menuTitle: varchar(),
});

export const textWithImageSectionsTable = pgTable("text_with_image_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  content: text().notNull(),
  image: varchar().notNull(),
});

export const gallerySectionsTable = pgTable("gallery_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  subtitle: varchar().notNull(),
});

export const galleryImagesTable = pgTable("gallery_images", {
  id: uuid().primaryKey().defaultRandom(),
  gallerySectionId: uuid()
    .notNull()
    .references(() => gallerySectionsTable.id, { onDelete: "cascade" }),
  imageUrl: varchar().notNull(),
  order: integer().notNull(),
});

export const centerTextSectionsTable = pgTable("center_text_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  content: text().notNull(),
});

export const reasonSectionsTable = pgTable("reason_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  subtitle: varchar().notNull(),
});

export const reasonItemsTable = pgTable("reason_items", {
  id: uuid().primaryKey().defaultRandom(),
  reasonSectionId: uuid()
    .notNull()
    .references(() => reasonSectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  description: text().notNull(),
  imageUrl: varchar(),
  order: integer().notNull(),
});
