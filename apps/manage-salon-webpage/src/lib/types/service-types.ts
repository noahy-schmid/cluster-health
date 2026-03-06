/**
 * Re-exports from the backend salon-domain.
 * The backend is the ground truth for all service-related types.
 */
export type {
  ServiceDefinition,
  ServicePhase,
  CreateServicePhaseInput,
  Resource,
  ServiceEmployeeItem,
} from "@repo/salon-domain";

export { SEAT_SLUG, CLIMAZON_SLUG } from "@repo/salon-domain";

/**
 * The type of a service definition.
 * - simple: Single phase requiring employee + chair
 * - coloration: Three hardcoded phases (Coloring, Heating, Finishing)
 * - custom: Fully customizable phases (existing behavior)
 */
export type ServiceType = "simple" | "coloration" | "custom";
