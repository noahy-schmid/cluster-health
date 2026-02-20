import { Context, Effect } from "effect";

/**
 * Port for checking salon-related information, such as whether a salon exists.
 */
export interface SalonPort {
  /**
   * Checks if a salon exists by its ID.
   * @param salonId The salon ID to check.
   * @returns Effect that resolves to true if the salon exists, false otherwise.
   */
  salonExists(salonId: string): Effect.Effect<boolean, never, never>;
}

/**
 * Context tag for the SalonPort service.
 */
export const SalonPort = Context.GenericTag<SalonPort>(
  "@repo/website-database/SalonPort",
);
