import { Context, Effect, Layer, Schema } from "effect";
import {
  StylistRepository,
  StylistRepositoryLive,
} from "../repository/stylist-repository";
import {
  StylistDatabaseError,
  StylistNotFoundError,
  StylistValidationError,
} from "../repository/stylist-errors";
import {
  CreateStylistInputSchema,
  Stylist,
  UpdateStylistInputSchema,
  type CreateStylistInput,
  type UpdateStylistInput,
} from "../types/stylists";

/**
 * Service layer for stylist domain logic.
 * Handles validation, business rules, and orchestrates repository calls.
 */
export interface StylistService {
  /**
   * Creates a new stylist with schema validation.
   * @param input Stylist details including salonId (will be validated).
   * @returns Effect that resolves to the created stylist.
   */
  createStylist(
    input: CreateStylistInput,
  ): Effect.Effect<
    Stylist,
    StylistDatabaseError | StylistValidationError,
    never
  >;

  /**
   * Fetches all stylists for a given salon.
   * @param salonId Salon ID to fetch stylists for.
   * @returns Effect that resolves to an array of stylists.
   */
  getStylistsBySalonId(
    salonId: string,
  ): Effect.Effect<Stylist[], StylistDatabaseError, never>;

  /**
   * Fetches a single stylist by ID.
   * @param id Stylist ID to look up.
   * @returns Effect that resolves to the stylist.
   */
  getStylistById(
    id: string,
  ): Effect.Effect<Stylist, StylistNotFoundError | StylistDatabaseError, never>;

  /**
   * Updates an existing stylist with schema validation.
   * @param id Stylist ID to update.
   * @param updates Fields to update (will be validated).
   * @returns Effect that resolves to the updated stylist.
   */
  updateStylist(
    id: string,
    updates: UpdateStylistInput,
  ): Effect.Effect<
    Stylist,
    StylistNotFoundError | StylistDatabaseError | StylistValidationError,
    never
  >;

  /**
   * Deletes a stylist.
   * @param id Stylist ID to delete.
   * @returns Effect that resolves when deletion completes.
   */
  deleteStylist(
    id: string,
  ): Effect.Effect<void, StylistNotFoundError | StylistDatabaseError, never>;
}

/**
 * Context tag for the StylistService.
 */
export const StylistService = Context.GenericTag<StylistService>(
  "@repo/salon-domain/StylistService",
);

const genStylistServiceLive: Effect.Effect<
  StylistService,
  never,
  StylistRepository
> = Effect.gen(function* () {
  const repository = yield* StylistRepository;

  const createStylist: StylistService["createStylist"] = (input) =>
    Effect.gen(function* () {
      yield* Effect.log("Creating stylist for salon", input.salonId);

      const validatedInput = yield* Schema.decode(CreateStylistInputSchema)(
        input,
      ).pipe(
        Effect.mapError(
          (err) => new StylistValidationError({ message: err.message }),
        ),
      );

      // Create stylist via repository
      const stylist = yield* repository.createStylist(validatedInput);

      yield* Effect.log("Stylist created successfully", stylist.id);
      return stylist;
    });

  const getStylistsBySalonId: StylistService["getStylistsBySalonId"] = (
    salonId,
  ) =>
    Effect.gen(function* () {
      yield* Effect.log("Fetching stylists for salon", salonId);
      const stylists = yield* repository.fetchStylistsBySalonId(salonId);
      yield* Effect.log(`Found ${stylists.length} stylists`);
      return stylists;
    });

  const getStylistById: StylistService["getStylistById"] = (id) =>
    Effect.gen(function* () {
      yield* Effect.log("Fetching stylist", id);
      const stylist = yield* repository.fetchStylistById(id);
      return stylist;
    });

  const updateStylist: StylistService["updateStylist"] = (id, updates) =>
    Effect.gen(function* () {
      yield* Effect.log("Updating stylist", id);

      const validatedUpdates = yield* Schema.decode(UpdateStylistInputSchema)(
        updates,
      ).pipe(
        Effect.mapError(
          (err) => new StylistValidationError({ message: err.message }),
        ),
      );

      // Update stylist via repository
      const updatedStylist = yield* repository.updateStylist(
        id,
        validatedUpdates,
      );

      yield* Effect.log("Stylist updated successfully", id);
      return updatedStylist;
    });

  const deleteStylist: StylistService["deleteStylist"] = (id) =>
    Effect.gen(function* () {
      yield* Effect.log("Deleting stylist", id);

      // Delete stylist via repository
      yield* repository.deleteStylist(id);

      yield* Effect.log("Stylist deleted successfully", id);
    });

  return {
    createStylist,
    getStylistsBySalonId,
    getStylistById,
    updateStylist,
    deleteStylist,
  };
});

/**
 * Live StylistService with batteries included.
 */
export const StylistServiceLive = Layer.effect(
  StylistService,
  genStylistServiceLive,
).pipe(Layer.provide(StylistRepositoryLive));
