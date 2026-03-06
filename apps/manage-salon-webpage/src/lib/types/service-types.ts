/**
 * Hard-coded resource ID for the employee/stylist resource.
 * This resource represents whether the stylist is occupied during a phase.
 */
export const EMPLOYEE_RESOURCE_ID = "resource-employee";

/**
 * Hard-coded resource ID for the salon chair/seat.
 */
export const SEAT_RESOURCE_ID = "resource-seat";

/**
 * Hard-coded resource ID for the heating lamp (Wärmehaube).
 */
export const HEATING_LAMP_RESOURCE_ID = "resource-heating-lamp";

/**
 * The type of a service definition.
 * - simple: Single phase requiring employee + chair
 * - coloration: Three hardcoded phases (Coloring, Heating, Finishing)
 * - custom: Fully customizable phases (existing behavior)
 */
export type ServiceType = "simple" | "coloration" | "custom";

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
  priceInCents: number;
  serviceType: ServiceType;
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
  priceInCents: number;
  serviceType: ServiceType;
  phases: Omit<ServicePhase, "id">[];
}

/**
 * Input for updating an existing service definition.
 */
export interface UpdateServiceDefinitionInput {
  name: string;
  description: string;
  priceInCents: number;
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
