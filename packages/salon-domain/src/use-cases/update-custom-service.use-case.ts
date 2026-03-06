import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
  type CreateServicePhaseInput,
} from "../application/service/service.aggregate";
import {
  InternalError,
  NotFoundError,
  ValidationError,
} from "../application/service/errors";
import { ServiceDefinitionPort } from "../ports/service-definition.port";
import { ResourcePort } from "../ports/resource.port";
import {
  ResourceMissingError,
  collapseErrorsToInternalError,
} from "../application/errors";

// --- Command DTO ---

export interface UpdateCustomServiceCommand {
  serviceId: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}

// --- Result DTO ---

export type UpdateCustomServiceResult = ServiceDefinition;

// --- Use Case ---

/**
 * Updates a custom service definition and replaces all its phases.
 * Validates that all referenced resource slugs exist in the same salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const serviceDefPort = yield* ServiceDefinitionPort;
  const resourcePort = yield* ResourcePort;

  return {
    /**
     * @param command - The service definition update data including new phases.
     * @returns Effect resolving to the updated service definition with computed duration.
     */
    execute: (
      command: UpdateCustomServiceCommand,
    ): Effect.Effect<
      UpdateCustomServiceResult,
      InternalError | NotFoundError | ValidationError | ResourceMissingError
    > =>
      Effect.gen(function* () {
        // Look up the service to get its salonId
        const serviceDef = yield* serviceDefPort
          .findServiceDefinitionById(command.serviceId)
          .pipe(
            Effect.mapError(
              collapseErrorsToInternalError("Failed to fetch service"),
            ),
          );

        if (!serviceDef) {
          return yield* Effect.fail(
            new NotFoundError({
              entity: "ServiceDefinition",
              id: command.serviceId,
            }),
          );
        }

        // Validate all referenced resource slugs exist in the salon
        const allResourceSlugs = [
          ...new Set(command.phases.flatMap((p) => p.requiredResourceSlugs)),
        ];

        for (const slug of allResourceSlugs) {
          const resource = yield* resourcePort
            .findResourceBySlug(serviceDef.salonId, slug)
            .pipe(
              Effect.mapError(
                collapseErrorsToInternalError(
                  `Failed to check resource: ${slug}`,
                ),
              ),
            );

          if (!resource) {
            return yield* Effect.fail(
              new ResourceMissingError({
                salonId: serviceDef.salonId,
                resourceSlug: slug,
              }),
            );
          }
        }

        return yield* aggregate.updateServiceDefinition(command.serviceId, {
          name: command.name,
          description: command.description,
          priceInCents: command.priceInCents,
          phases: command.phases,
        });
      }),
  };
});

export class UpdateCustomServiceUseCase extends Effect.Service<UpdateCustomServiceUseCase>()(
  "@repo/salon-domain/UpdateCustomServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
