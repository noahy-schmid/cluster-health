import { Effect } from "effect";
import {
  ResourceAggregate,
  type Resource,
} from "../application/resource/resource.aggregate";
import { InternalError, ValidationError } from "../application/resource/errors";
import {
  NotFoundError,
  collapseErrorsToInternalError,
} from "../application/errors";
import { SalonPort } from "../ports/salon.port";

// --- Command DTO ---

export interface CreateResourceCommand {
  salonId: string;
  slug: string;
  name: string;
  amount: number;
}

// --- Result DTO ---

export type CreateResourceResult = Resource;

// --- Use Case ---

/**
 * Creates a new salon resource. Validates that the salon exists first.
 */
const make = Effect.gen(function* () {
  const aggregate = yield* ResourceAggregate;
  const salonPort = yield* SalonPort;

  return {
    /**
     * @param command - The resource creation data including salonId, slug, name, and amount.
     * @returns Effect resolving to the created resource.
     */
    execute: (
      command: CreateResourceCommand,
    ): Effect.Effect<
      CreateResourceResult,
      InternalError | ValidationError | NotFoundError
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

        return yield* aggregate.createResource(
          command.salonId,
          command.slug,
          command.name,
          command.amount,
        );
      }),
  };
});

export class CreateResourceUseCase extends Effect.Service<CreateResourceUseCase>()(
  "@repo/salon-domain/CreateResourceUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [ResourceAggregate.Default],
  },
) {}
