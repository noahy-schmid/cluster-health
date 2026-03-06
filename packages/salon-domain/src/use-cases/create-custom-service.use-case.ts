import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
  type CreateServicePhaseInput,
} from "../application/service/service.aggregate";
import {
  InternalError,
  ValidationError,
  NotFoundError,
} from "../application/service/errors";
import { ResourcePort } from "../ports/resource.port";
import { SalonPort } from "../ports/salon.port";
import {
  ResourceMissingError,
  collapseErrorsToInternalError,
} from "../application/errors";

// --- Command DTO ---

export interface CreateCustomServiceCommand {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  phases: CreateServicePhaseInput[];
}

// --- Result DTO ---

export type CreateCustomServiceResult = ServiceDefinition;

// --- Use Case ---

/**
 * Creates a custom service definition with user-defined phases.
 * Validates that the salon exists and that all referenced resource slugs exist in the salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const salonPort = yield* SalonPort;
  const resourcePort = yield* ResourcePort;

  return {
    /**
     * @param command - The custom service creation data including phases.
     * @returns Effect resolving to the created service definition with computed duration.
     */
    execute: (
      command: CreateCustomServiceCommand,
    ): Effect.Effect<
      CreateCustomServiceResult,
      InternalError | ValidationError | NotFoundError | ResourceMissingError
    > =>
      Effect.gen(function* () {
        // Validate salon exists
        const salonExists = yield* salonPort
          .salonExists(command.salonId)
          .pipe(
            Effect.mapError(
              collapseErrorsToInternalError("Failed to check salon existence"),
            ),
          );

        if (!salonExists) {
          return yield* Effect.fail(
            new NotFoundError({ entity: "Salon", id: command.salonId }),
          );
        }

        // Validate all referenced resource slugs exist in the salon
        const allResourceSlugs = [
          ...new Set(command.phases.flatMap((p) => p.requiredResourceSlugs)),
        ];

        for (const slug of allResourceSlugs) {
          const resource = yield* resourcePort
            .findResourceBySlug(command.salonId, slug)
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
                salonId: command.salonId,
                resourceSlug: slug,
              }),
            );
          }
        }

        return yield* aggregate.createServiceDefinition({
          salonId: command.salonId,
          serviceType: "custom",
          name: command.name,
          description: command.description,
          priceInCents: command.priceInCents,
          phases: command.phases,
        });
      }),
  };
});

export class CreateCustomServiceUseCase extends Effect.Service<CreateCustomServiceUseCase>()(
  "@repo/salon-domain/CreateCustomServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
