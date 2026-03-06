import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
} from "../application/service/service.aggregate";
import { InternalError, ValidationError } from "../application/service/errors";
import { ResourcePort } from "../ports/resource.port";
import { ResourceMissingError } from "../application/errors";

// --- Constants ---

const EMPLOYEE_SLUG = "employee";
const SEAT_SLUG = "seat";

// --- Command DTO ---

export interface CreateSimpleServiceCommand {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  durationMinutes: number;
}

// --- Result DTO ---

export type CreateSimpleServiceResult = ServiceDefinition;

// --- Use Case ---

/**
 * Creates a "simple" service definition with a single phase requiring an
 * employee and a seat. Verifies that both required resources exist in the salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const resourcePort = yield* ResourcePort;

  return {
    /**
     * @param command - The simple service creation data.
     * @returns Effect resolving to the created service definition.
     */
    execute: (
      command: CreateSimpleServiceCommand,
    ): Effect.Effect<
      CreateSimpleServiceResult,
      InternalError | ValidationError | ResourceMissingError
    > =>
      Effect.gen(function* () {
        // Verify required resources exist in the salon
        for (const slug of [EMPLOYEE_SLUG, SEAT_SLUG]) {
          const resource = yield* resourcePort
            .findResourceBySlug(command.salonId, slug)
            .pipe(
              Effect.mapError(
                (error) =>
                  new InternalError({
                    message: `Failed to check resource: ${error.message}`,
                    cause: error,
                  }),
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
          serviceType: "simple",
          name: command.name,
          description: command.description,
          priceInCents: command.priceInCents,
          phases: [
            {
              name: "Service",
              durationMinutes: command.durationMinutes,
              requiredResourceSlugs: [EMPLOYEE_SLUG, SEAT_SLUG],
            },
          ],
        });
      }),
  };
});

export class CreateSimpleServiceUseCase extends Effect.Service<CreateSimpleServiceUseCase>()(
  "@repo/salon-domain/CreateSimpleServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
