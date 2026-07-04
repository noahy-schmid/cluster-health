import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortStylistAvailability {
  id: string;
  stylistId: string;
  salonId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortStylistAvailabilityException {
  id: string;
  stylistId: string;
  salonId: string;
  date: string;
  isAbsent: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortCreateStylistAvailabilityInput {
  stylistId: string;
  salonId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
}

export interface PortCreateStylistAvailabilityExceptionInput {
  stylistId: string;
  salonId: string;
  date: string;
  isAbsent: boolean;
  startTime?: string | null;
  endTime?: string | null;
  reason?: string | null;
}

// --- Port interface ---

/**
 * Port for stylist availability persistence operations.
 */
export interface StylistAvailabilityPort {
  /**
   * Creates or replaces availability for a stylist on a specific day of the week.
   */
  upsertAvailability(
    input: PortCreateStylistAvailabilityInput,
  ): Effect.Effect<PortStylistAvailability, InfrastructureError>;

  /**
   * Deletes a stylist's availability for a specific day of the week.
   * Returns true if deleted, false if not found.
   */
  deleteAvailability(
    stylistId: string,
    dayOfWeek: number,
  ): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Lists all weekly availability windows for a stylist, ordered by dayOfWeek.
   */
  listAvailability(
    stylistId: string,
  ): Effect.Effect<PortStylistAvailability[], InfrastructureError>;

  /**
   * Creates or replaces an availability exception for a specific date.
   */
  upsertAvailabilityException(
    input: PortCreateStylistAvailabilityExceptionInput,
  ): Effect.Effect<PortStylistAvailabilityException, InfrastructureError>;

  /**
   * Deletes an availability exception by its ID.
   * Returns true if deleted, false if not found.
   */
  deleteAvailabilityException(
    id: string,
  ): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Lists all availability exceptions for a stylist, ordered by date ascending.
   */
  listAvailabilityExceptions(
    stylistId: string,
  ): Effect.Effect<PortStylistAvailabilityException[], InfrastructureError>;
}

/**
 * Context tag for the StylistAvailabilityPort service.
 */
export const StylistAvailabilityPort =
  Context.GenericTag<StylistAvailabilityPort>(
    "@repo/salon-domain/StylistAvailabilityPort",
  );
