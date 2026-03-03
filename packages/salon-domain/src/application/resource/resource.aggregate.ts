import { Effect, Layer } from "effect";
import { ResourcePort, type PortResource } from "../../ports/resource.port";
import {
  ResourceError,
  ResourceNotFoundError,
  ResourceValidationError,
  ResourceInUseError,
} from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresResourceAdapter } from "../../adapters/postgres-resource.adapter";

// --- Domain types ---

export interface Resource {
  id: string;
  salonId: string;
  type: string;
  name: string;
  amount: number;
  createdAt: Date;
  updatedAt: Date;
}

const fromPort = (portResource: PortResource): Resource => ({
  id: portResource.id,
  salonId: portResource.salonId,
  type: portResource.type,
  name: portResource.name,
  amount: portResource.amount,
  createdAt: portResource.createdAt,
  updatedAt: portResource.updatedAt,
});

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const resourcePort = yield* ResourcePort;

  const createResource = (
    salonId: string,
    type: string,
    name: string,
    amount: number,
  ) =>
    Effect.gen(function* () {
      if (!type.trim()) {
        return yield* Effect.fail(
          new ResourceValidationError({
            message: "Resource type cannot be empty",
          }),
        );
      }
      if (!name.trim()) {
        return yield* Effect.fail(
          new ResourceValidationError({
            message: "Resource name cannot be empty",
          }),
        );
      }
      if (amount < 1) {
        return yield* Effect.fail(
          new ResourceValidationError({
            message: "Resource amount must be at least 1",
          }),
        );
      }

      const portResource = yield* resourcePort
        .createResource({
          salonId,
          type: type.trim(),
          name: name.trim(),
          amount,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new ResourceError({
                salonId,
                message: error.message,
              }),
          ),
        );

      yield* Effect.log("Resource created", portResource.id);
      return fromPort(portResource);
    });

  const updateResource = (resourceId: string, name: string, amount: number) =>
    Effect.gen(function* () {
      if (!name.trim()) {
        return yield* Effect.fail(
          new ResourceValidationError({
            message: "Resource name cannot be empty",
          }),
        );
      }
      if (amount < 1) {
        return yield* Effect.fail(
          new ResourceValidationError({
            message: "Resource amount must be at least 1",
          }),
        );
      }

      const updated = yield* resourcePort
        .updateResource(resourceId, { name: name.trim(), amount })
        .pipe(
          Effect.mapError(
            (error) =>
              new ResourceError({
                resourceId,
                message: error.message,
              }),
          ),
        );

      if (!updated) {
        return yield* Effect.fail(new ResourceNotFoundError({ resourceId }));
      }

      yield* Effect.log("Resource updated", resourceId);
      return fromPort(updated);
    });

  const deleteResource = (resourceId: string) =>
    Effect.gen(function* () {
      // First find the resource to get its type
      const resource = yield* resourcePort.findResourceById(resourceId).pipe(
        Effect.mapError(
          (error) =>
            new ResourceError({
              resourceId,
              message: error.message,
            }),
        ),
      );

      if (!resource) {
        return yield* Effect.fail(new ResourceNotFoundError({ resourceId }));
      }

      // Check if the resource type is still referenced
      const isReferenced = yield* resourcePort
        .isResourceTypeReferenced(resource.type)
        .pipe(
          Effect.mapError(
            (error) =>
              new ResourceError({
                resourceId,
                message: error.message,
              }),
          ),
        );

      if (isReferenced) {
        return yield* Effect.fail(
          new ResourceInUseError({
            resourceType: resource.type,
            message: `Cannot delete resource: type "${resource.type}" is still referenced by service phases`,
          }),
        );
      }

      const deleted = yield* resourcePort.deleteResource(resourceId).pipe(
        Effect.mapError(
          (error) =>
            new ResourceError({
              resourceId,
              message: error.message,
            }),
        ),
      );

      if (!deleted) {
        return yield* Effect.fail(new ResourceNotFoundError({ resourceId }));
      }

      yield* Effect.log("Resource deleted", resourceId);
    });

  const listResources = (salonId: string) =>
    Effect.gen(function* () {
      const portResources = yield* resourcePort
        .listResourcesBySalonId(salonId)
        .pipe(
          Effect.mapError(
            (error) =>
              new ResourceError({
                salonId,
                message: error.message,
              }),
          ),
        );

      return portResources.map(fromPort);
    });

  return {
    createResource,
    updateResource,
    deleteResource,
    listResources,
  };
});

export class ResourceAggregate extends Effect.Service<ResourceAggregate>()(
  "@repo/salon-domain/ResourceAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresResourceAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
