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
  date,
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
  profileImageMediaId: uuid().references(() => mediaFilesTable.id, {
    onDelete: "set null",
  }),
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

// --- Opening hours ---

/**
 * Weekly recurring salon opening hours.
 * dayOfWeek: 0=Monday, 1=Tuesday, ..., 6=Sunday (ISO week convention)
 * openTime/closeTime: "HH:mm" 24-hour format, e.g. "09:00", "18:30"
 */
export const salonOpeningHoursTable = salonSchema.table("salon_opening_hours", {
  id: uuid().primaryKey().defaultRandom(),
  salonId: uuid()
    .notNull()
    .references(() => salonsTable.id, { onDelete: "cascade" }),
  dayOfWeek: integer().notNull(),
  openTime: varchar({ length: 5 }).notNull(),
  closeTime: varchar({ length: 5 }).notNull(),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

/**
 * Date-specific exceptions to the salon's regular opening hours.
 * date: ISO date string "YYYY-MM-DD"
 * isClosed: if true the salon is closed that day regardless of openTime/closeTime
 * openTime/closeTime: custom hours when not closed (nullable)
 */
export const salonOpeningHoursExceptionsTable = salonSchema.table(
  "salon_opening_hours_exceptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    salonId: uuid()
      .notNull()
      .references(() => salonsTable.id, { onDelete: "cascade" }),
    date: date().notNull(),
    isClosed: boolean().notNull().default(true),
    openTime: varchar({ length: 5 }),
    closeTime: varchar({ length: 5 }),
    reason: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
);

/**
 * Weekly recurring stylist availability windows.
 * dayOfWeek: 0=Monday ... 6=Sunday
 * startTime/endTime: "HH:mm" 24-hour format
 */
export const stylistAvailabilityTable = salonSchema.table(
  "stylist_availability",
  {
    id: uuid().primaryKey().defaultRandom(),
    stylistId: uuid()
      .notNull()
      .references(() => stylistsTable.id, { onDelete: "cascade" }),
    salonId: uuid()
      .notNull()
      .references(() => salonsTable.id, { onDelete: "cascade" }),
    dayOfWeek: integer().notNull(),
    startTime: varchar({ length: 5 }).notNull(),
    endTime: varchar({ length: 5 }).notNull(),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
);

/**
 * Date-specific exceptions to a stylist's regular availability.
 * date: ISO date string "YYYY-MM-DD"
 * isAbsent: if true the stylist is absent the whole day
 * startTime/endTime: custom availability when not absent (nullable)
 */
export const stylistAvailabilityExceptionsTable = salonSchema.table(
  "stylist_availability_exceptions",
  {
    id: uuid().primaryKey().defaultRandom(),
    stylistId: uuid()
      .notNull()
      .references(() => stylistsTable.id, { onDelete: "cascade" }),
    salonId: uuid()
      .notNull()
      .references(() => salonsTable.id, { onDelete: "cascade" }),
    date: date().notNull(),
    isAbsent: boolean().notNull().default(true),
    startTime: varchar({ length: 5 }),
    endTime: varchar({ length: 5 }),
    reason: varchar({ length: 255 }),
    createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
  },
);
