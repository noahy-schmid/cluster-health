import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortServicePhaseWithResources {
  id: string;
  name: string;
  durationMinutes: number;
  order: number;
  requiredResourceSlugs: string[];
}

export interface PortFullServiceDefinition {
  id: string;
  salonId: string;
  serviceType: string;
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
 * Port for reading service definitions with their phases and resource requirements.
 * Implementations are responsible for handling performance characteristics
 * (for example, avoiding N+1 query patterns).
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
  ): Effect.Effect<PortFullServiceDefinition | null, InfrastructureError>;

  /**
   * Fetches all service definitions for a salon with phases and resource requirements.
   * @param salonId Salon ID.
   * @param options Optional settings. `includeDeleted` defaults to false.
   * @returns Effect resolving to array of full service definitions.
   */
  listFullServiceDefinitionsBySalonId(
    salonId: string,
    options?: { includeDeleted?: boolean },
  ): Effect.Effect<PortFullServiceDefinition[], InfrastructureError>;
}

/**
 * Context tag for the ReadServicePort service.
 */
export const ReadServicePort = Context.GenericTag<ReadServicePort>(
  "@repo/salon-domain/ReadServicePort",
);
