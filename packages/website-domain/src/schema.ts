import {
  integer,
  pgSchema,
  pgTable,
  text,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import type { PgTableFn } from "drizzle-orm/pg-core";

import { WEBSITE_SCHEMA_NAME } from "./schema-config";

// Create schema-aware table function
// If using public schema (no prefix), use pgTable directly
// Otherwise, use schema.table
const websiteSchema =
  WEBSITE_SCHEMA_NAME === "public"
    ? { table: pgTable }
    : pgSchema(WEBSITE_SCHEMA_NAME);

const createTable = websiteSchema.table as PgTableFn;

export const websitesTable = createTable("websites", {
  id: uuid().primaryKey().defaultRandom(),
  salonId: uuid().notNull().unique(),
  heroImage: varchar().notNull(),
  logo: varchar().notNull(),
  heroTitle: varchar().notNull(),
  subtitle: varchar().notNull(),
  textColor: varchar().notNull().default("light"),
  slug: varchar().notNull().unique(),
  title: varchar().notNull(),
  faviconMediaId: varchar(),
  menuBarTitle: varchar(),
  menuLogoPosition: varchar().notNull().default("left"),
  colorBackgroundBase: varchar().notNull(),
  colorBackgroundElevation1: varchar().notNull(),
  colorBackgroundElevation2: varchar().notNull(),
  colorForegroundBase: varchar().notNull(),
  colorForegroundMuted: varchar().notNull(),
  colorForegroundStrong: varchar().notNull(),
  colorAccent: varchar().notNull(),
  colorOnAccent: varchar().notNull(),
});

export const sectionsTable = createTable("sections", {
  id: uuid().primaryKey().defaultRandom(),
  websiteId: uuid()
    .notNull()
    .references(() => websitesTable.id, { onDelete: "cascade" }),
  type: varchar().notNull(),
  order: integer().notNull(),
  menuTitle: varchar(),
});

export const textWithImageSectionsTable = createTable(
  "text_with_image_sections",
  {
    id: uuid()
      .primaryKey()
      .references(() => sectionsTable.id, { onDelete: "cascade" }),
    title: varchar().notNull(),
    content: text().notNull(),
    image: varchar().notNull(),
  },
);

export const gallerySectionsTable = createTable("gallery_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  subtitle: varchar().notNull(),
});

export const galleryImagesTable = createTable("gallery_images", {
  id: uuid().primaryKey().defaultRandom(),
  gallerySectionId: uuid()
    .notNull()
    .references(() => gallerySectionsTable.id, { onDelete: "cascade" }),
  imageUrl: varchar().notNull(),
  order: integer().notNull(),
});

export const centerTextSectionsTable = createTable("center_text_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  content: text().notNull(),
});

export const reasonSectionsTable = createTable("reason_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  subtitle: varchar().notNull(),
});

export const reasonItemsTable = createTable("reason_items", {
  id: uuid().primaryKey().defaultRandom(),
  reasonSectionId: uuid()
    .notNull()
    .references(() => reasonSectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  description: text().notNull(),
  imageUrl: varchar(),
  order: integer().notNull(),
});

export const stylistsSectionsTable = createTable("stylists_sections", {
  id: uuid()
    .primaryKey()
    .references(() => sectionsTable.id, { onDelete: "cascade" }),
  title: varchar().notNull(),
  subtitle: varchar().notNull(),
});
