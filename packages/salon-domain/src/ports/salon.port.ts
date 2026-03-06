import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port interface ---

/**
 * Port for salon lookup operations.
 * Used by use cases to validate that a salon exists before creating resources.
 */
export interface SalonPort {
  /**
   * Checks whether a salon with the given ID exists.
   * @param salonId Salon ID to check.
   * @returns Effect resolving to true if the salon exists.
   */
  salonExists(salonId: string): Effect.Effect<boolean, InfrastructureError>;
}

/**
 * Context tag for the SalonPort service.
 */
export const SalonPort = Context.GenericTag<SalonPort>(
  "@repo/salon-domain/SalonPort",
);
