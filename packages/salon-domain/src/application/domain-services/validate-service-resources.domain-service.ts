import { Effect } from "effect";
import { ResourcePort } from "../../ports/resource.port";
import { InternalError, ValidationError } from "../errors";

// --- Domain Service ---

/**
 * Validates that all resource IDs referenced by service phases exist
 * and belong to the same salon as the service.
 */
const make = Effect.gen(function* () {
  const resourcePort = yield* ResourcePort;

  return {
    /**
     * Validates resource IDs for a service.
     * @param salonId Salon ID the service belongs to.
     * @param resourceIds All resource IDs referenced by service phases.
     * @returns Effect resolving to void if valid, failing with ValidationError otherwise.
     */
    validate: (
      salonId: string,
      resourceIds: string[],
    ): Effect.Effect<void, InternalError | ValidationError> =>
      Effect.gen(function* () {
        if (resourceIds.length === 0) {
          return;
        }

        const uniqueIds = [...new Set(resourceIds)];

        const resources = yield* resourcePort
          .findResourcesByIds(uniqueIds)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to validate resources: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        const foundIds = new Set(resources.map((r) => r.id));
        const missingIds = uniqueIds.filter((id) => !foundIds.has(id));

        if (missingIds.length > 0) {
          return yield* Effect.fail(
            new ValidationError({
              message: `Resources not found: ${missingIds.join(", ")}`,
            }),
          );
        }

        const wrongSalonResources = resources.filter(
          (r) => r.salonId !== salonId,
        );

        if (wrongSalonResources.length > 0) {
          return yield* Effect.fail(
            new ValidationError({
              message: `Resources do not belong to the same salon: ${wrongSalonResources.map((r) => r.id).join(", ")}`,
            }),
          );
        }
      }),
  };
});

/**
 * Domain service for validating resource references in service definitions.
 * Ensures all referenced resources exist and belong to the same salon as the service.
 * Used by CreateServiceDefinitionUseCase and UpdateServiceDefinitionUseCase.
 */
export class ValidateServiceResourcesDomainService extends Effect.Service<ValidateServiceResourcesDomainService>()(
  "@repo/salon-domain/ValidateServiceResourcesDomainService",
  {
    effect: make,
    accessors: true,
    dependencies: [],
  },
) {}
