import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when a service definition persistence operation fails at the database level.
 */
export class ServiceDefinitionPersistenceError extends Data.TaggedError(
  "ServiceDefinitionPersistenceError",
)<{
  message: string;
  cause?: unknown;
}> {}

// --- Port-owned types ---

export interface PortServiceDefinitionRow {
  id: string;
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  createdAt: Date;
  updatedAt: Date;
  deletedAt: Date | null;
}

export interface PortCreateServiceDefinitionInput {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
}

export interface PortUpdateServiceDefinitionInput {
  name: string;
  description: string;
  priceInCents: number;
}

// --- Port interface ---

/**
 * Port for service_definitions table persistence operations.
 */
export interface ServiceDefinitionPort {
  /**
   * Creates a new service definition row.
   * @param input Service definition data.
   * @returns Effect resolving to the created row.
   */
  createServiceDefinition(
    input: PortCreateServiceDefinitionInput,
  ): Effect.Effect<PortServiceDefinitionRow, ServiceDefinitionPersistenceError>;

  /**
   * Updates a service definition row.
   * @param serviceId Service definition ID to update.
   * @param input Updated fields.
   * @returns Effect resolving to the updated row, or null if not found.
   */
  updateServiceDefinition(
    serviceId: string,
    input: PortUpdateServiceDefinitionInput,
  ): Effect.Effect<
    PortServiceDefinitionRow | null,
    ServiceDefinitionPersistenceError
  >;

  /**
   * Soft-deletes a service definition by setting deletedAt.
   * @param serviceId Service definition ID to soft-delete.
   * @returns Effect resolving to true if soft-deleted, false if not found.
   */
  softDeleteServiceDefinition(
    serviceId: string,
  ): Effect.Effect<boolean, ServiceDefinitionPersistenceError>;

  /**
   * Fetches a service definition row by ID (excludes soft-deleted).
   * @param serviceId Service definition ID to fetch.
   * @returns Effect resolving to the row or null.
   */
  findServiceDefinitionById(
    serviceId: string,
  ): Effect.Effect<
    PortServiceDefinitionRow | null,
    ServiceDefinitionPersistenceError
  >;

  /**
   * Checks if a service definition exists (excludes soft-deleted).
   * @param serviceId Service definition ID to check.
   * @returns Effect resolving to true if exists.
   */
  serviceDefinitionExists(
    serviceId: string,
  ): Effect.Effect<boolean, ServiceDefinitionPersistenceError>;
}

/**
 * Context tag for the ServiceDefinitionPort service.
 */
export const ServiceDefinitionPort = Context.GenericTag<ServiceDefinitionPort>(
  "@repo/salon-domain/ServiceDefinitionPort",
);
