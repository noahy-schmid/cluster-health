import { Effect } from "effect";
import { ResourcePort } from "../../ports/resource.port";
import { InternalError, ValidationError } from "../errors";

// --- Domain Service ---

/**
 * Validates that all resource slugs referenced by service phases exist
 * and belong to the given salon.
 */
const make = Effect.gen(function* () {
  const resourcePort = yield* ResourcePort;

  return {
    /**
     * Validates resource slugs for a service.
     * @param salonId Salon ID the service belongs to.
     * @param resourceSlugs All resource slugs referenced by service phases.
     * @returns Effect resolving to void if valid, failing with ValidationError otherwise.
     */
    validate: (
      salonId: string,
      resourceSlugs: string[],
    ): Effect.Effect<void, InternalError | ValidationError> =>
      Effect.gen(function* () {
        if (resourceSlugs.length === 0) {
          return;
        }

        const uniqueSlugs = [...new Set(resourceSlugs)];

        const resources = yield* resourcePort
          .findResourcesBySlugs(salonId, uniqueSlugs)
          .pipe(
            Effect.mapError(
              (error) =>
                new InternalError({
                  message: `Failed to validate resources: ${error.message}`,
                  cause: error,
                }),
            ),
          );

        const foundSlugs = new Set(resources.map((r) => r.slug));
        const missingSlugs = uniqueSlugs.filter(
          (slug) => !foundSlugs.has(slug),
        );

        if (missingSlugs.length > 0) {
          return yield* Effect.fail(
            new ValidationError({
              message: `Resources not found in salon: ${missingSlugs.join(", ")}`,
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
