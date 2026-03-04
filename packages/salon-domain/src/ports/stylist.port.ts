import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortStylist {
  id: string;
  salonId: string;
  name: string;
}

// --- Port interface ---

/**
 * Port for stylist lookup operations.
 * Used by use cases for cross-aggregate validation and data enrichment.
 */
export interface StylistPort {
  /**
   * Checks whether a stylist with the given ID exists.
   * @param stylistId Stylist ID to check.
   * @returns Effect resolving to true if the stylist exists.
   */
  stylistExists(stylistId: string): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Fetches a stylist by ID.
   * @param stylistId Stylist ID to fetch.
   * @returns Effect resolving to the stylist or null if not found.
   */
  getStylistById(
    stylistId: string,
  ): Effect.Effect<PortStylist | null, InfrastructureError>;
}

/**
 * Context tag for the StylistPort service.
 */
export const StylistPort = Context.GenericTag<StylistPort>(
  "@repo/salon-domain/StylistPort",
);
