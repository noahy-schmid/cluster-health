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
const CLIMAZON_SLUG = "climazon";

// --- Command DTO ---

export interface CreateColorationServiceCommand {
  salonId: string;
  name: string;
  description: string;
  priceInCents: number;
  /** Duration in minutes for phase 1 (application — employee + seat). */
  applicationDurationMinutes: number;
  /** Duration in minutes for phase 2 (processing — seat + climazon, no employee). */
  processingDurationMinutes: number;
  /** Duration in minutes for phase 3 (finishing — employee + seat). */
  finishingDurationMinutes: number;
}

// --- Result DTO ---

export type CreateColorationServiceResult = ServiceDefinition;

// --- Use Case ---

/**
 * Creates a "coloration" service definition with three phases:
 *  1. Application — requires employee + seat
 *  2. Processing — requires seat + climazon (employee is free)
 *  3. Finishing — requires employee + seat
 *
 * Verifies that all required resources (employee, seat, climazon) exist in the salon.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ServiceAggregate;
  const resourcePort = yield* ResourcePort;

  return {
    /**
     * @param command - The coloration service creation data with three durations.
     * @returns Effect resolving to the created service definition.
     */
    execute: (
      command: CreateColorationServiceCommand,
    ): Effect.Effect<
      CreateColorationServiceResult,
      InternalError | ValidationError | ResourceMissingError
    > =>
      Effect.gen(function* () {
        // Verify required resources exist in the salon
        for (const slug of [EMPLOYEE_SLUG, SEAT_SLUG, CLIMAZON_SLUG]) {
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
          serviceType: "coloration",
          name: command.name,
          description: command.description,
          priceInCents: command.priceInCents,
          phases: [
            {
              name: "Application",
              durationMinutes: command.applicationDurationMinutes,
              requiredResourceSlugs: [EMPLOYEE_SLUG, SEAT_SLUG],
            },
            {
              name: "Processing",
              durationMinutes: command.processingDurationMinutes,
              requiredResourceSlugs: [SEAT_SLUG, CLIMAZON_SLUG],
            },
            {
              name: "Finishing",
              durationMinutes: command.finishingDurationMinutes,
              requiredResourceSlugs: [EMPLOYEE_SLUG, SEAT_SLUG],
            },
          ],
        });
      }),
  };
});

export class CreateColorationServiceUseCase extends Effect.Service<CreateColorationServiceUseCase>()(
  "@repo/salon-domain/CreateColorationServiceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ServiceAggregate.Default],
  },
) {}
