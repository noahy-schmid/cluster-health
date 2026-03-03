import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when a stylist lookup operation fails.
 */
export class StylistPortError extends Data.TaggedError("StylistPortError")<{
  message: string;
  cause?: unknown;
}> {}

// --- Port interface ---

/**
 * Port for checking stylist existence.
 * Used by the employee-service aggregate to verify stylist references.
 */
export interface StylistPort {
  /**
   * Checks whether a stylist with the given ID exists.
   * @param stylistId Stylist ID to check.
   * @returns Effect resolving to true if the stylist exists.
   */
  stylistExists(stylistId: string): Effect.Effect<boolean, StylistPortError>;
}

/**
 * Context tag for the StylistPort service.
 */
export const StylistPort = Context.GenericTag<StylistPort>(
  "@repo/salon-domain/StylistPort",
);
