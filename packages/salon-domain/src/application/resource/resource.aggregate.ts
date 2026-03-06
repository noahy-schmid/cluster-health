import { Effect, Layer } from "effect";
import { ResourcePort, type PortResource } from "../../ports/resource.port";
import { InternalError, NotFoundError, ValidationError } from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresResourceAdapter } from "../../adapters/postgres-resource.adapter";

// --- Well-known resource slugs ---

/** Resource slug for styling seats / chairs. */
export const SEAT_SLUG = "seat";

/** Resource slug for climazon heating lamps. */
export const CLIMAZON_SLUG = "climazon";

// --- Domain types (re-export port types directly since there is no mapping needed) ---

export type Resource = PortResource;

// --- Aggregate service ---

const make = Effect.gen(function* () {
  const resourcePort = yield* ResourcePort;

  const createResource = (
    salonId: string,
    slug: string,
    name: string,
    amount: number,
  ) =>
    Effect.gen(function* () {
      if (!slug.trim()) {
        return yield* Effect.fail(
          new ValidationError({
            message: "Resource slug cannot be empty",
          }),
        );
      }
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
        .createResource({
          salonId,
          slug: slug.trim(),
          name: name.trim(),
          amount,
        })
        .pipe(
          Effect.mapError(
            (error) =>
              new InternalError({
                message: error.message,
                cause: error,
              }),
          ),
        );

      yield* Effect.log("Resource created", salonId, slug);
      return resource;
    });

  const updateResource = (
    salonId: string,
    slug: string,
    name: string,
    amount: number,
  ) =>
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
        .updateResource(salonId, slug, { name: name.trim(), amount })
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
          new NotFoundError({ entity: "Resource", id: `${salonId}/${slug}` }),
        );
      }

      yield* Effect.log("Resource updated", salonId, slug);
      return updated;
    });

  const deleteResource = (salonId: string, slug: string) =>
    Effect.gen(function* () {
      const deleted = yield* resourcePort.deleteResource(salonId, slug).pipe(
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
          new NotFoundError({ entity: "Resource", id: `${salonId}/${slug}` }),
        );
      }

      yield* Effect.log("Resource deleted", salonId, slug);
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
