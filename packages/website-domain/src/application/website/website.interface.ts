import { Context, Effect, Option } from "effect";
import type {
  CreateWebsiteInput,
  UpdateWebsiteSettingsInput,
  WebsiteId,
  WebsiteSettings,
} from "../../types/website";
import type {
  WebsiteAlreadyExistsError,
  WebsiteDatabaseError,
  WebsiteNotFoundError,
  WebsiteValidationError,
} from "../../types/website-errors";

/**
 * Service layer for the website aggregate.
 */
export interface WebsiteService {
  /**
   * Creates a new website with standard configuration.
   * Settings and the salon need to be provided.
   * @param input Website Settings plus salonId.
   * @returns Effect that resolves to the created website ID.
   */
  createWebsite(
    input: CreateWebsiteInput,
  ): Effect.Effect<
    WebsiteId,
    WebsiteDatabaseError | WebsiteValidationError | WebsiteAlreadyExistsError,
    never
  >;

  /**
   * Fetches a website by its unique ID.
   * @param id Website ID to look up.
   * @returns Effect that resolves to the website.
   */
  getWebsiteSettingsById(
    id: WebsiteId,
  ): Effect.Effect<
    WebsiteSettings,
    WebsiteNotFoundError | WebsiteDatabaseError,
    never
  >;

  /**
   * Fetches a website by salon ID.
   * @param salonId Salon ID to look up the website for.
   * @returns Effect that resolves to the website.
   */
  getWebsiteSettingsBySalonId(
    salonId: string,
  ): Effect.Effect<
    WebsiteSettings,
    WebsiteNotFoundError | WebsiteDatabaseError,
    never
  >;

  /**
   * Fetches website settings by slug.
   * @param slug Website slug to look up.
   * @returns Effect that resolves to the website settings.
   */
  getWebsiteSettingsBySlug(
    slug: string,
  ): Effect.Effect<
    WebsiteSettings,
    WebsiteNotFoundError | WebsiteDatabaseError,
    never
  >;

  /**
   * Updates website settings with schema validation.
   * Only updates slug and title fields.
   * @param id Website ID to update.
   * @param updates Fields to update (will be validated).
   * @returns Effect that resolves to the updated website.
   */
  updateWebsiteSettings(
    id: WebsiteId,
    updates: UpdateWebsiteSettingsInput,
  ): Effect.Effect<
    WebsiteSettings,
    | WebsiteNotFoundError
    | WebsiteDatabaseError
    | WebsiteValidationError
    | WebsiteAlreadyExistsError,
    never
  >;

  /**
   * Checks if a website exists for a given salon.
   * @param salonId Salon ID to check.
   * @returns Effect that resolves to the website ID if it exists, or none if not.
   */
  websiteExistsForSalon(
    salonId: string,
  ): Effect.Effect<Option.Option<WebsiteId>, WebsiteDatabaseError, never>;
}

/**
 * Context tag for the WebsiteService.
 */
export const WebsiteService = Context.GenericTag<WebsiteService>(
  "@repo/website-domain/WebsiteService",
);
