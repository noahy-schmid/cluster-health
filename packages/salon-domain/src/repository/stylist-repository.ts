import { Context, Effect, Layer } from "effect";
import { eq } from "drizzle-orm";
import { db } from "../database";
import { stylistsTable } from "../schema";
import {
  CreateStylistInput,
  Stylist,
  UpdateStylistInput,
} from "../types/stylists";
import { StylistDatabaseError, StylistNotFoundError } from "./stylist-errors";

/**
 * Effect service for managing stylist database operations.
 */
export interface StylistRepository {
  /**
   * Creates a new stylist record.
   * @param input Stylist details including salonId.
   * @returns Effect that resolves to the created stylist.
   */
  createStylist(
    input: CreateStylistInput,
  ): Effect.Effect<Stylist, StylistDatabaseError, never>;

  /**
   * Fetches all stylists for a salon.
   * @param salonId Salon ID to fetch stylists for.
   * @returns Effect that resolves to an array of stylists.
   */
  fetchStylistsBySalonId(
    salonId: string,
  ): Effect.Effect<Stylist[], StylistDatabaseError, never>;

  /**
   * Fetches a single stylist by ID.
   * @param id Stylist ID to look up.
   * @returns Effect that resolves to the stylist.
   */
  fetchStylistById(
    id: string,
  ): Effect.Effect<Stylist, StylistNotFoundError | StylistDatabaseError, never>;

  /**
   * Updates an existing stylist.
   * @param id Stylist ID to update.
   * @param updates Fields to update.
   * @returns Effect that resolves to the updated stylist.
   */
  updateStylist(
    id: string,
    updates: UpdateStylistInput,
  ): Effect.Effect<Stylist, StylistNotFoundError | StylistDatabaseError, never>;

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
 * Context tag for the StylistRepository service.
 */
export const StylistRepository = Context.GenericTag<StylistRepository>(
  "@repo/salon-domain/StylistRepository",
);

const genStylistRepositoryLive: Effect.Effect<StylistRepository> = Effect.gen(
  function* () {
    yield* Effect.log("Initializing StylistRepositoryLive");

    const createStylist: StylistRepository["createStylist"] = (input) =>
      Effect.gen(function* () {
        const [created] = yield* Effect.tryPromise({
          try: async () =>
            await db
              .insert(stylistsTable)
              .values({
                salonId: input.salonId,
                name: input.name,
                subtitle: input.subtitle,
                description: input.description,
                profileImage: input.profileImage,
              })
              .returning(),
          catch: (error) =>
            new StylistDatabaseError({
              message: "Failed to create stylist",
              cause: error,
            }),
        });

        if (!created) {
          return yield* Effect.fail(
            new StylistDatabaseError({
              message: "Failed to create stylist: no row returned",
            }),
          );
        }

        yield* Effect.log("Stylist created", created.id);
        return created;
      });

    const fetchStylistsBySalonId: StylistRepository["fetchStylistsBySalonId"] =
      (salonId) =>
        Effect.gen(function* () {
          const stylists = yield* Effect.tryPromise({
            try: async () =>
              await db
                .select()
                .from(stylistsTable)
                .where(eq(stylistsTable.salonId, salonId)),
            catch: (error) =>
              new StylistDatabaseError({
                message: "Failed to fetch stylists",
                cause: error,
              }),
          });

          yield* Effect.log(
            `Fetched ${stylists.length} stylists for salon`,
            salonId,
          );
          return stylists;
        });

    const fetchStylistById: StylistRepository["fetchStylistById"] = (id) =>
      Effect.gen(function* () {
        const [stylist] = yield* Effect.tryPromise({
          try: async () =>
            await db
              .select()
              .from(stylistsTable)
              .where(eq(stylistsTable.id, id)),
          catch: (error) =>
            new StylistDatabaseError({
              message: "Failed to fetch stylist",
              cause: error,
            }),
        });

        if (!stylist) {
          return yield* Effect.fail(
            new StylistNotFoundError({ stylistId: id }),
          );
        }

        yield* Effect.log("Fetched stylist", id);
        return stylist;
      });

    const updateStylist: StylistRepository["updateStylist"] = (id, updates) =>
      Effect.gen(function* () {
        const [updated] = yield* Effect.tryPromise({
          try: async () =>
            await db
              .update(stylistsTable)
              .set({
                name: updates.name,
                subtitle: updates.subtitle,
                description: updates.description,
                profileImage: updates.profileImage,
                updatedAt: new Date(),
              })
              .where(eq(stylistsTable.id, id))
              .returning(),
          catch: (error) =>
            new StylistDatabaseError({
              message: "Failed to update stylist",
              cause: error,
            }),
        });

        if (!updated) {
          return yield* Effect.fail(
            new StylistNotFoundError({ stylistId: id }),
          );
        }

        yield* Effect.log("Stylist updated", id);
        return updated;
      });

    const deleteStylist: StylistRepository["deleteStylist"] = (id) =>
      Effect.gen(function* () {
        const result = yield* Effect.tryPromise({
          try: async () =>
            await db
              .delete(stylistsTable)
              .where(eq(stylistsTable.id, id))
              .returning(),
          catch: (error) =>
            new StylistDatabaseError({
              message: "Failed to delete stylist",
              cause: error,
            }),
        });

        if (result.length === 0) {
          return yield* Effect.fail(
            new StylistNotFoundError({ stylistId: id }),
          );
        }

        yield* Effect.log("Stylist deleted", id);
      });

    return {
      createStylist,
      fetchStylistsBySalonId,
      fetchStylistById,
      updateStylist,
      deleteStylist,
    };
  },
);

/**
 * Live service layer for StylistRepository.
 */
export const StylistRepositoryLive = Layer.effect(
  StylistRepository,
  genStylistRepositoryLive,
);
