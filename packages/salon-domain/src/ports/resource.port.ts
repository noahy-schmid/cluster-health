import { Context, Effect } from "effect";
import { InfrastructureError } from "../application/errors";

// --- Port-owned types ---

export interface PortResource {
  id: string;
  salonId: string;
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface PortCreateResourceInput {
  salonId: string;
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
  ): Effect.Effect<PortResource, InfrastructureError>;

  /**
   * Updates an existing resource's name and amount.
   * @param resourceId Resource ID to update.
   * @param input Updated name and amount.
   * @returns Effect resolving to the updated resource, or null if not found.
   */
  updateResource(
    resourceId: string,
    input: PortUpdateResourceInput,
  ): Effect.Effect<PortResource | null, InfrastructureError>;

  /**
   * Deletes a resource by ID.
   * @param resourceId Resource ID to delete.
   * @returns Effect resolving to true if deleted, false if not found.
   */
  deleteResource(
    resourceId: string,
  ): Effect.Effect<boolean, InfrastructureError>;

  /**
   * Fetches a resource by ID.
   * @param resourceId Resource ID to fetch.
   * @returns Effect resolving to the resource or null.
   */
  findResourceById(
    resourceId: string,
  ): Effect.Effect<PortResource | null, InfrastructureError>;

  /**
   * Fetches all resources for a salon.
   * @param salonId Salon ID to fetch resources for.
   * @returns Effect resolving to array of resources.
   */
  listResourcesBySalonId(
    salonId: string,
  ): Effect.Effect<PortResource[], InfrastructureError>;

  /**
   * Fetches multiple resources by their IDs.
   * @param resourceIds Array of resource IDs to fetch.
   * @returns Effect resolving to array of found resources.
   */
  findResourcesByIds(
    resourceIds: string[],
  ): Effect.Effect<PortResource[], InfrastructureError>;
}

/**
 * Context tag for the ResourcePort service.
 */
export const ResourcePort = Context.GenericTag<ResourcePort>(
  "@repo/salon-domain/ResourcePort",
);
