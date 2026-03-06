import { sql } from "drizzle-orm";
import {
  boolean,
  integer,
  pgSchema,
  primaryKey,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
  text,
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

export const mediaFilesTable = salonSchema.table("media_files", {
  id: uuid().primaryKey().defaultRandom(),
  salonId: uuid()
    .notNull()
    .references(() => salonsTable.id, { onDelete: "cascade" }),
  fileName: varchar().notNull(),
  mimeType: varchar().notNull(),
  fileSize: integer().notNull(),
  s3Key: varchar().notNull(),
  uploadConfirmed: boolean().default(false).notNull(),
  createdAt: timestamp({ withTimezone: true }).defaultNow().notNull(),
});

export const salonResourcesTable = salonSchema.table(
  "salon_resources",
  {
    salonId: uuid()
      .notNull()
      .references(() => salonsTable.id, { onDelete: "cascade" }),
    slug: varchar({ length: 100 }).notNull(),
    name: varchar({ length: 255 }).notNull(),
    amount: integer().notNull().default(1),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.salonId, table.slug] }),
  }),
);

export const serviceDefinitionsTable = salonSchema.table(
  "service_definitions",
  {
    id: uuid().primaryKey().defaultRandom(),
    salonId: uuid()
      .notNull()
      .references(() => salonsTable.id, { onDelete: "cascade" }),
    serviceType: varchar({ length: 50 }).notNull().default("custom"),
    name: varchar({ length: 255 }).notNull(),
    description: text().notNull().default(""),
    priceInCents: integer().notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp({ withTimezone: true }),
  },
);

export const servicePhasesTable = salonSchema.table("service_phases", {
  id: uuid().primaryKey().defaultRandom(),
  serviceDefinitionId: uuid()
    .notNull()
    .references(() => serviceDefinitionsTable.id, { onDelete: "cascade" }),
  name: varchar({ length: 255 }).notNull(),
  durationMinutes: integer().notNull(),
  order: integer().notNull().default(0),
  employeeRequired: boolean().notNull().default(true),
});

export const phaseResourceRequirementsTable = salonSchema.table(
  "phase_resource_requirements",
  {
    id: uuid().primaryKey().defaultRandom(),
    phaseId: uuid()
      .notNull()
      .references(() => servicePhasesTable.id, { onDelete: "cascade" }),
    resourceSlug: varchar({ length: 100 }).notNull(),
  },
);

export const employeeServiceAssignmentsTable = salonSchema.table(
  "employee_service_assignments",
  {
    stylistId: uuid()
      .notNull()
      .references(() => stylistsTable.id, { onDelete: "cascade" }),
    serviceDefinitionId: uuid()
      .notNull()
      .references(() => serviceDefinitionsTable.id, { onDelete: "cascade" }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    pk: primaryKey({ columns: [table.stylistId, table.serviceDefinitionId] }),
  }),
);
