import { Context, Data, Effect } from "effect";

// --- Port-level error ---

/**
 * Raised when a resource persistence operation fails at the database level.
 */
export class ResourcePersistenceError extends Data.TaggedError(
  "ResourcePersistenceError",
)<{
  message: string;
  cause?: unknown;
}> {}

// --- Port-owned types ---

export interface PortResource {
  id: string;
  salonId: string;
  type: string;
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortCreateResourceInput {
  salonId: string;
  type: string;
  name: string;
  amount: number;
}

export interface PortUpdateResourceInput {
  name: string;
  amount: number;
}

// --- Port interface ---

/**
 * Port for salon resource persistence operations.
 */
export interface ResourcePort {
  /**
   * Creates a new salon resource.
   * @param input Resource data to create.
   * @returns Effect resolving to the created resource.
   */
  createResource(
    input: PortCreateResourceInput,
  ): Effect.Effect<PortResource, ResourcePersistenceError>;

  /**
   * Updates an existing resource's name and amount.
   * @param resourceId Resource ID to update.
   * @param input Updated name and amount.
   * @returns Effect resolving to the updated resource, or null if not found.
   */
  updateResource(
    resourceId: string,
    input: PortUpdateResourceInput,
  ): Effect.Effect<PortResource | null, ResourcePersistenceError>;

  /**
   * Deletes a resource by ID.
   * @param resourceId Resource ID to delete.
   * @returns Effect resolving to true if deleted, false if not found.
   */
  deleteResource(
    resourceId: string,
  ): Effect.Effect<boolean, ResourcePersistenceError>;

  /**
   * Fetches a resource by ID.
   * @param resourceId Resource ID to fetch.
   * @returns Effect resolving to the resource or null.
   */
  findResourceById(
    resourceId: string,
  ): Effect.Effect<PortResource | null, ResourcePersistenceError>;

  /**
   * Fetches all resources for a salon.
   * @param salonId Salon ID to fetch resources for.
   * @returns Effect resolving to array of resources.
   */
  listResourcesBySalonId(
    salonId: string,
  ): Effect.Effect<PortResource[], ResourcePersistenceError>;

  /**
   * Checks if a resource type is referenced by any service phase.
   * @param resourceType The resource type string to check.
   * @returns Effect resolving to true if referenced.
   */
  isResourceTypeReferenced(
    resourceType: string,
  ): Effect.Effect<boolean, ResourcePersistenceError>;
}

/**
 * Context tag for the ResourcePort service.
 */
export const ResourcePort = Context.GenericTag<ResourcePort>(
  "@repo/salon-domain/ResourcePort",
);
