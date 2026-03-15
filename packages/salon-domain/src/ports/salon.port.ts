import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortSalon {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortCreateSalonInput {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
}

export interface PortUpdateSalonInput {
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
}

// --- Port interface ---

/**
 * Port for salon persistence operations.
 */
export interface SalonPort {
  /**
   * Creates a new salon.
   * @param input Salon data to create.
   * @returns Effect resolving to the created salon.
   */
  createSalon(
    input: PortCreateSalonInput,
  ): Effect.Effect<PortSalon, InfrastructureError>;

  /**
   * Fetches a salon by its ID.
   * @param salonId Salon ID to fetch.
   * @returns Effect resolving to the salon or null.
   */
  findSalonById(
    salonId: string,
  ): Effect.Effect<PortSalon | null, InfrastructureError>;

  /**
   * Fetches a salon by its name using case-insensitive lookup.
   * @param name Salon name to fetch.
   * @returns Effect resolving to the salon or null.
   */
  findSalonByName(
    name: string,
  ): Effect.Effect<PortSalon | null, InfrastructureError>;

  /**
   * Updates an existing salon.
   * @param salonId Salon ID to update.
   * @param input Updated salon data.
   * @returns Effect resolving to the updated salon or null if not found.
   */
  updateSalon(
    salonId: string,
    input: PortUpdateSalonInput,
  ): Effect.Effect<PortSalon | null, InfrastructureError>;

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
