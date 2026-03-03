import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when a service phase persistence operation fails at the database level.
 */
export class ServicePhasePersistenceError extends Data.TaggedError(
  "ServicePhasePersistenceError",
)<{
  message: string;
  cause?: unknown;
}> {}

// --- Port-owned types ---

export interface PortServicePhaseRow {
  id: string;
  serviceDefinitionId: string;
  name: string;
  durationMinutes: number;
  order: number;
}

export interface PortPhaseResourceRequirementRow {
  id: string;
  phaseId: string;
  resourceId: string;
}

export interface PortCreateServicePhaseInput {
  serviceDefinitionId: string;
  name: string;
  durationMinutes: number;
  order: number;
  requiredResourceIds: string[];
}

// --- Port interface ---

/**
 * Port for service_phases and phase_resource_requirements table operations.
 */
export interface ServicePhasePort {
  /**
   * Creates a service phase with its resource requirements.
   * @param input Phase data including required resource IDs.
   * @returns Effect resolving to the created phase row.
   */
  createPhase(
    input: PortCreateServicePhaseInput,
  ): Effect.Effect<PortServicePhaseRow, ServicePhasePersistenceError>;

  /**
   * Deletes all phases for a service definition (cascades to requirements).
   * @param serviceDefinitionId Service definition ID.
   * @returns Effect resolving when deletion completes.
   */
  deletePhasesByServiceDefinitionId(
    serviceDefinitionId: string,
  ): Effect.Effect<void, ServicePhasePersistenceError>;

  /**
   * Fetches all phases for a service definition with their resource requirements.
   * @param serviceDefinitionId Service definition ID.
   * @returns Effect resolving to phases with their resource requirement IDs.
   */
  listPhasesByServiceDefinitionId(
    serviceDefinitionId: string,
  ): Effect.Effect<
    (PortServicePhaseRow & { requiredResourceIds: string[] })[],
    ServicePhasePersistenceError
  >;

  /**
   * Checks if a resource is referenced by any service phase requirement.
   * @param resourceId The resource ID to check.
   * @returns Effect resolving to true if referenced.
   */
  isResourceReferenced(
    resourceId: string,
  ): Effect.Effect<boolean, ServicePhasePersistenceError>;
}

/**
 * Context tag for the ServicePhasePort service.
 */
export const ServicePhasePort = Context.GenericTag<ServicePhasePort>(
  "@repo/salon-domain/ServicePhasePort",
);
