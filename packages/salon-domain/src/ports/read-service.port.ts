import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when a read-service persistence operation fails at the database level.
 */
export class ReadServicePersistenceError extends Data.TaggedError(
  "ReadServicePersistenceError",
)<{
  message: string;
  cause?: unknown;
}> {}

// --- Port-owned types ---

export interface PortServicePhaseWithResources {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  requiredResourceIds: string[];
}

export interface PortFullServiceDefinition {
  id: string;
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: PortServicePhaseWithResources[];
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

// --- Port interface ---

/**
 * Port for reading service definitions with their phases joined.
 * Optimised for read performance using database joins.
 */
export interface ReadServicePort {
  /**
   * Fetches a service definition by ID with all phases and resource requirements.
   * Excludes soft-deleted services.
   * @param serviceId Service definition ID.
   * @returns Effect resolving to the full service definition or null.
   */
  findFullServiceDefinitionById(
    serviceId: string,
  ): Effect.Effect<
    PortFullServiceDefinition | null,
    ReadServicePersistenceError
  >;

  /**
   * Fetches all service definitions for a salon with phases and resource requirements.
   * Excludes soft-deleted services.
   * @param salonId Salon ID.
   * @returns Effect resolving to array of full service definitions.
   */
  listFullServiceDefinitionsBySalonId(
    salonId: string,
  ): Effect.Effect<PortFullServiceDefinition[], ReadServicePersistenceError>;
}

/**
 * Context tag for the ReadServicePort service.
 */
export const ReadServicePort = Context.GenericTag<ReadServicePort>(
  "@repo/salon-domain/ReadServicePort",
);
