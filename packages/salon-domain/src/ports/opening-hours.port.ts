import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortOpeningHours {
  id: string;
  salonId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortOpeningHoursException {
  id: string;
  salonId: string;
  date: string;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  reason: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortCreateOpeningHoursInput {
  salonId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
}

export interface PortCreateOpeningHoursExceptionInput {
  salonId: string;
  date: string;
  isClosed: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  reason?: string | null;
}

// --- Port interface ---

/**
 * Port for salon opening hours persistence operations.
 */
export interface OpeningHoursPort {
  /**
   * Creates or replaces opening hours for a specific day of the week.
   * If a record already exists for that salonId+dayOfWeek, it is replaced.
   */
  upsertOpeningHours(
    input: PortCreateOpeningHoursInput,
  ): Effect.Effect<PortOpeningHours, InfrastructureError>;

  /**
   * Deletes opening hours for a specific day of the week (marking the day closed).
   * Returns true if deleted, false if not found.
   */
  deleteOpeningHours(
    salonId: string,
    dayOfWeek: number,
  ): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Fetches all weekly opening hours for a salon, ordered by dayOfWeek.
   */
  listOpeningHours(
    salonId: string,
  ): Effect.Effect<PortOpeningHours[], InfrastructureError>;

  /**
   * Creates an exception for a specific date.
   * If an exception already exists for that date it is replaced.
   */
  upsertOpeningHoursException(
    input: PortCreateOpeningHoursExceptionInput,
  ): Effect.Effect<PortOpeningHoursException, InfrastructureError>;

  /**
   * Deletes an exception by its ID.
   * Returns true if deleted, false if not found.
   */
  deleteOpeningHoursException(
    id: string,
  ): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Lists all exceptions for a salon, ordered by date ascending.
   */
  listOpeningHoursExceptions(
    salonId: string,
  ): Effect.Effect<PortOpeningHoursException[], InfrastructureError>;
}

/**
 * Context tag for the OpeningHoursPort service.
 */
export const OpeningHoursPort = Context.GenericTag<OpeningHoursPort>(
  "@repo/salon-domain/OpeningHoursPort",
);
