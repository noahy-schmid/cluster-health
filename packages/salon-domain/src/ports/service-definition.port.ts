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

export interface PortPhaseResourceRequirement {
  resourceType: string;
}

export interface PortServicePhase {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  requiredResources: PortPhaseResourceRequirement[];
}

export interface PortServiceDefinition {
  id: string;
  salonId: string;
  name: string;
  description: string;
  price: string;
  phases: PortServicePhase[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PortCreateServicePhaseInput {
  name: string;
  durationMinutes: number;
  order: number;
  requiredResources: PortPhaseResourceRequirement[];
}

export interface PortCreateServiceDefinitionInput {
  salonId: string;
  name: string;
  description: string;
  price: string;
  phases: PortCreateServicePhaseInput[];
}

export interface PortUpdateServiceDefinitionInput {
  name: string;
  description: string;
  price: string;
  phases: PortCreateServicePhaseInput[];
}

// --- Port interface ---

/**
 * Port for service definition persistence operations.
 */
export interface ServiceDefinitionPort {
  /**
   * Creates a new service definition with its phases.
   * @param input Service definition data including phases.
   * @returns Effect resolving to the created service definition.
   */
  createServiceDefinition(
    input: PortCreateServiceDefinitionInput,
  ): Effect.Effect<PortServiceDefinition, ServiceDefinitionPersistenceError>;

  /**
   * Updates a service definition and replaces all its phases.
   * @param serviceId Service definition ID to update.
   * @param input Updated service definition data including new phases.
   * @returns Effect resolving to the updated service definition, or null if not found.
   */
  updateServiceDefinition(
    serviceId: string,
    input: PortUpdateServiceDefinitionInput,
  ): Effect.Effect<
    PortServiceDefinition | null,
    ServiceDefinitionPersistenceError
  >;

  /**
   * Deletes a service definition by ID (cascade deletes phases and assignments).
   * @param serviceId Service definition ID to delete.
   * @returns Effect resolving to true if deleted, false if not found.
   */
  deleteServiceDefinition(
    serviceId: string,
  ): Effect.Effect<boolean, ServiceDefinitionPersistenceError>;

  /**
   * Fetches a service definition by ID with all its phases.
   * @param serviceId Service definition ID to fetch.
   * @returns Effect resolving to the service definition or null.
   */
  findServiceDefinitionById(
    serviceId: string,
  ): Effect.Effect<
    PortServiceDefinition | null,
    ServiceDefinitionPersistenceError
  >;

  /**
   * Fetches all service definitions for a salon with their phases.
   * @param salonId Salon ID to fetch service definitions for.
   * @returns Effect resolving to array of service definitions.
   */
  listServiceDefinitionsBySalonId(
    salonId: string,
  ): Effect.Effect<PortServiceDefinition[], ServiceDefinitionPersistenceError>;
}

/**
 * Context tag for the ServiceDefinitionPort service.
 */
export const ServiceDefinitionPort = Context.GenericTag<ServiceDefinitionPort>(
  "@repo/salon-domain/ServiceDefinitionPort",
);
