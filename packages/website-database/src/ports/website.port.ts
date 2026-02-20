import { Context, Effect, Option } from "effect";
import type { WebsiteDatabaseError } from "../types/website-errors";
import { websitesTable } from "../schema";

export type SelectDatabaseWebsite = typeof websitesTable.$inferSelect;
export type InsertDatabaseWebsite = typeof websitesTable.$inferInsert;

/**
 * Port for operations regarding the websites Table.
 */
export interface WebsiteRepository {
  /**
   * Creates a new website record.
   * @param input Website details including salonId and all configuration.
   * @returns Effect that resolves to the created website.
   */
  createWebsite(
    input: InsertDatabaseWebsite,
  ): Effect.Effect<SelectDatabaseWebsite, WebsiteDatabaseError, never>;

  /**
   * Fetches a website by its unique ID.
   * @param id Website ID to look up.
   * @returns Effect that resolves to the website.
   */
  getWebsiteById(
    id: string,
  ): Effect.Effect<
    Option.Option<SelectDatabaseWebsite>,
    WebsiteDatabaseError,
    never
  >;

  /**
   * Fetches a website by salon ID.
   * @param salonId Salon ID to look up the website for.
   * @returns Effect that resolves to the website.
   */
  getWebsiteBySalonId(
    salonId: string,
  ): Effect.Effect<
    Option.Option<SelectDatabaseWebsite>,
    WebsiteDatabaseError,
    never
  >;

  /**
   * Checks if a salon has a website.
   * @param salonId the salon ID to check.
   * @returns Effect that resolves to true if the salon has a website, false otherwise.
   */
  hasWebsiteForSalonId(
    salonId: string,
  ): Effect.Effect<boolean, WebsiteDatabaseError, never>;

  /**
   * Updates fields of the website.
   * @param id Website ID to update.
   * @param updates Fields to update.
   * @returns Effect that resolves to the updated website.
   */
  updateWebsite(
    id: string,
    updates: Partial<InsertDatabaseWebsite>,
  ): Effect.Effect<
    Option.Option<SelectDatabaseWebsite>,
    WebsiteDatabaseError,
    never
  >;
}

/**
 * Context tag for the WebsiteRepository service.
 */
export const WebsiteRepository = Context.GenericTag<WebsiteRepository>(
  "@repo/website-database/WebsiteRepository",
);
