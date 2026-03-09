import { Effect } from "effect";
import {
  ServiceAggregate,
  type ServiceDefinition,
} from "../application/service/service.aggregate";
import {
  InternalError,
  NotFoundError,
  ValidationError,
} from "../application/service/errors";
import { ResourcePort } from "../ports/resource.port";
import { SalonPort } from "../ports/salon.port";
import {
  ResourceMissingError,
  collapseErrorsToInternalError,
} from "../application/errors";
import { SEAT_SLUG } from "../application/resource/resource.constants";

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
 * employee (employeeRequired=true) and a seat resource.
 * Verifies that the salon exists and the seat resource is present.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const resourcePort = yield* ResourcePort;
  const salonPort = yield* SalonPort;

  return {
    /**
     * @param command - The simple service creation data.
     * @returns Effect resolving to the created service definition.
     */
    execute: (
      command: CreateSimpleServiceCommand,
    ): Effect.Effect<
      CreateSimpleServiceResult,
      InternalError | NotFoundError | ValidationError | ResourceMissingError
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

        // Verify seat resource exists in the salon
        const seatResource = yield* resourcePort
          .findResourceBySlug(command.salonId, SEAT_SLUG)
          .pipe(
            Effect.mapError(
              collapseErrorsToInternalError("Failed to check seat resource"),
            ),
          );

        if (!seatResource) {
          return yield* Effect.fail(
            new ResourceMissingError({
              salonId: command.salonId,
              resourceSlug: SEAT_SLUG,
            }),
          );
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
              employeeRequired: true,
              requiredResourceSlugs: [SEAT_SLUG],
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
