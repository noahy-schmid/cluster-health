/**
 * Represents a resource available in the salon (e.g., heating lamp, wash sink, seat).
 * The "employee" resource is hard-coded and always available.
 */
export interface SalonResource {
  id: string;
  salonId: string;
  name: string;
}

/**
 * Represents a resource requirement for a service phase.
 */
export interface ResourceRequirement {
  resourceId: string;
  resourceName: string;
}

/**
 * Represents a single phase/step in a service workflow.
 * Each phase has a duration and a list of required resources.
 */
export interface ServicePhase {
  id: string;
  name: string;
  durationMinutes: number;
  requiresEmployee: boolean;
  requiredResources: ResourceRequirement[];
  order: number;
}

/**
 * Represents a complete service definition offered by the salon.
 */
export interface ServiceDefinition {
  id: string;
  salonId: string;
  name: string;
  description: string;
  phases: ServicePhase[];
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Input for creating a new service definition.
 */
export interface CreateServiceDefinitionInput {
  salonId: string;
  name: string;
  description: string;
  phases: Omit<ServicePhase, "id">[];
}

/**
 * Input for updating an existing service definition.
 */
export interface UpdateServiceDefinitionInput {
  name: string;
  description: string;
  phases: Omit<ServicePhase, "id">[];
}

/**
 * Represents the assignment of a stylist to a service they can provide.
 */
export interface StylistServiceAssignment {
  stylistId: string;
  stylistName: string;
  serviceId: string;
  serviceName: string;
}
