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

// Keep resource slugs local to avoid a runtime dependency from client code to the backend package.
export const SEAT_SLUG = "seat";
export const CLIMAZON_SLUG = "climazon";
