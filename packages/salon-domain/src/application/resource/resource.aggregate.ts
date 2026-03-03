import { Effect, Layer } from "effect";
import { ResourcePort, type PortResource } from "../../ports/resource.port";
import { InternalError, NotFoundError, ValidationError } from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresResourceAdapter } from "../../adapters/postgres-resource.adapter";

// --- Domain types (re-export port types directly since there is no mapping needed) ---

export type Resource = PortResource;

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const resourcePort = yield* ResourcePort;

  const createResource = (salonId: string, name: string, amount: number) =>
    Effect.gen(function* () {
      if (!name.trim()) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Resource name cannot be empty",
          }),
        );
      }
      if (amount < 1) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Resource amount must be at least 1",
          }),
        );
      }

      const resource = yield* resourcePort
        .createResource({ salonId, name: name.trim(), amount })
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );

      yield* Effect.log("Resource created", resource.id);
      return resource;
    });

  const updateResource = (resourceId: string, name: string, amount: number) =>
    Effect.gen(function* () {
      if (!name.trim()) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Resource name cannot be empty",
          }),
        );
      }
      if (amount < 1) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Resource amount must be at least 1",
          }),
        );
      }

      const updated = yield* resourcePort
        .updateResource(resourceId, { name: name.trim(), amount })
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );

      if (!updated) {
        return yield* Effect.fail(
          new NotFoundError({ entity: "Resource", id: resourceId }),
        );
      }

      yield* Effect.log("Resource updated", resourceId);
      return updated;
    });

  const deleteResource = (resourceId: string) =>
    Effect.gen(function* () {
      const deleted = yield* resourcePort.deleteResource(resourceId).pipe(
        Effect.mapError(
          (error) =>
            new InternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );

      if (!deleted) {
        return yield* Effect.fail(
          new NotFoundError({ entity: "Resource", id: resourceId }),
        );
      }

      yield* Effect.log("Resource deleted", resourceId);
    });

  const listResources = (salonId: string) =>
    resourcePort.listResourcesBySalonId(salonId).pipe(
      Effect.mapError(
        (error) =>
          new InternalError({
            message: error.message,
            cause: error,
          }),
      ),
    );

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
