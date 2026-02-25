import { Effect, Layer, Option, Schema } from "effect";
import type {
  CreateWebsiteInput,
  WebsiteId,
  WebsiteSettings,
} from "../../types/website";
import {
  CreateWebsiteInputSchema,
  UpdateWebsiteSettingsInputSchema,
} from "../../types/website";
import {
  WebsiteAlreadyExistsError,
  WebsiteDatabaseError,
  WebsiteNotFoundError,
  WebsiteValidationError,
} from "../../types/website-errors";
import type { WebsiteService } from "./website.interface";
import { WebsiteService as WebsiteServiceTag } from "./website.interface";
import { SalonPort } from "../../ports/salon.port";
import {
  WebsitePort,
  type InsertDatabaseWebsite,
  type SelectDatabaseWebsite,
} from "../../ports/website.port";

/**
 * Maps database website record to WebsiteSettings domain model.
 */
const mapToWebsiteSettings = (
  dbWebsite: SelectDatabaseWebsite,
): WebsiteSettings => ({
  title: dbWebsite.title,
  slug: dbWebsite.slug,
  favicon: Option.fromNullable(dbWebsite.favicon),
});

/**
 * Implementation of the WebsiteService using Effect.
 */
const make = Effect.gen(function* () {
  const websiteRepo = yield* WebsitePort;
  const salonPort = yield* SalonPort;

  const createWebsite = (
    input: CreateWebsiteInput,
  ): Effect.Effect<
    WebsiteId,
    WebsiteDatabaseError | WebsiteValidationError | WebsiteAlreadyExistsError,
    never
  > =>
    Effect.gen(function* () {
      // Validate input
      const validatedInput = yield* Schema.decode(CreateWebsiteInputSchema)(
        input,
      ).pipe(
        Effect.mapError(
          (error) =>
            new WebsiteValidationError({
              message: `Invalid website input: ${error.message}`,
            }),
        ),
      );

      // Check if salon exists
      const salonExistsResult = yield* salonPort.salonExists(
        validatedInput.salonId,
      );

      if (!salonExistsResult) {
        yield* Effect.logWarning(
          "Tried to create website for non-existent salon ID: ",
          validatedInput.salonId,
        );
        return yield* Effect.fail(
          new WebsiteValidationError({
            message: `Salon with ID ${validatedInput.salonId} does not exist`,
          }),
        );
      }

      // Prepare database insert
      const insertData: InsertDatabaseWebsite = {
        salonId: validatedInput.salonId,
        slug: validatedInput.slug,
        title: validatedInput.title,
        favicon: Option.getOrNull(validatedInput.favicon),
        // Default values for required fields - these should come from business logic or defaults
        heroImage: "",
        logo: "",
        heroTitle: "",
        subtitle: "",
        textColor: "light",
        colorBackgroundBase: "#ffffff",
        colorBackgroundElevation1: "#f5f5f5",
        colorBackgroundElevation2: "#eeeeee",
        colorForegroundBase: "#000000",
        colorForegroundMuted: "#666666",
        colorForegroundStrong: "#000000",
        colorAccent: "#007bff",
        colorOnAccent: "#ffffff",
      };

      const result = yield* websiteRepo
        .createWebsite(insertData)
        .pipe(
          Effect.tapError((error) =>
            Effect.logError("Failed to create website:", error),
          ),
        );

      return result.id as WebsiteId;
    });

  const getWebsiteSettingsById: WebsiteService["getWebsiteSettingsById"] = (
    id,
  ) =>
    Effect.gen(function* () {
      const websiteOption = yield* websiteRepo.getWebsiteById(id);

      if (Option.isNone(websiteOption)) {
        return yield* Effect.fail(new WebsiteNotFoundError({ websiteId: id }));
      }

      return mapToWebsiteSettings(websiteOption.value);
    });

  const getWebsiteSettingsBySalonId: WebsiteService["getWebsiteSettingsBySalonId"] =
    (
      salonId: string,
    ): Effect.Effect<
      WebsiteSettings,
      WebsiteNotFoundError | WebsiteDatabaseError,
      never
    > =>
      Effect.gen(function* () {
        const websiteOption = yield* websiteRepo.getWebsiteBySalonId(salonId);

        if (Option.isNone(websiteOption)) {
          return yield* Effect.fail(new WebsiteNotFoundError({ salonId }));
        }

        return mapToWebsiteSettings(websiteOption.value);
      });

  const getWebsiteSettingsBySlug: WebsiteService["getWebsiteSettingsBySlug"] = (
    slug: string,
  ): Effect.Effect<
    WebsiteSettings,
    WebsiteNotFoundError | WebsiteDatabaseError,
    never
  > =>
    Effect.gen(function* () {
      const websiteOption = yield* websiteRepo.getWebsiteBySlug(slug);

      if (Option.isNone(websiteOption)) {
        return yield* Effect.fail(
          new WebsiteNotFoundError({ websiteSlug: slug }),
        );
      }

      return mapToWebsiteSettings(websiteOption.value);
    });

  const updateWebsiteSettings: WebsiteService["updateWebsiteSettings"] = (
    id,
    updates,
  ) =>
    Effect.gen(function* () {
      // Validate input
      const validatedUpdates = yield* Schema.decode(
        UpdateWebsiteSettingsInputSchema,
      )(updates).pipe(
        Effect.mapError(
          (error) =>
            new WebsiteValidationError({
              message: `Invalid website settings update: ${error.message}`,
            }),
        ),
      );

      // Prepare database update - only include provided fields
      const updateData: Partial<InsertDatabaseWebsite> = {};
      if (validatedUpdates.title !== undefined) {
        updateData.title = validatedUpdates.title;
      }
      if (validatedUpdates.slug !== undefined) {
        updateData.slug = validatedUpdates.slug;
      }
      if (validatedUpdates.favicon !== undefined) {
        updateData.favicon = Option.getOrNull(validatedUpdates.favicon);
      }

      const updatedWebsiteOption = yield* websiteRepo
        .updateWebsite(id, updateData)
        .pipe(
          Effect.tapError((error) =>
            Effect.logError("Failed to update website:", error),
          ),
        );

      if (Option.isNone(updatedWebsiteOption)) {
        return yield* Effect.fail(new WebsiteNotFoundError({ websiteId: id }));
      }

      return mapToWebsiteSettings(updatedWebsiteOption.value);
    });

  return {
    createWebsite,
    getWebsiteSettingsById,
    getWebsiteSettingsBySalonId,
    getWebsiteSettingsBySlug,
    updateWebsiteSettings,
  } satisfies WebsiteService;
});

/**
 * Layer that provides the WebsiteService implementation.
 * Depends on WebsiteRepository and SalonPort.
 */
export const WebsiteServiceLive = Layer.effect(WebsiteServiceTag, make);
