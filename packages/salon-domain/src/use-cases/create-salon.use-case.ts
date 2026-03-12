import { Effect } from "effect";
import {
  SalonAggregate,
  type Salon,
} from "../application/salon/salon.aggregate";
import {
  ConflictError,
  InternalError,
  ValidationError,
} from "../application/salon/errors";

export interface CreateSalonCommand {
  /**
   * The name of the salon to create. Must be unique (case-insensitive) across all salons.
   */
  name: string;
  /**
   * The street address of the salon. Location existance is not validated.
   */
  street: string;
  /**
   * Postal code of the salon address.
   */
  postalCode: string;
  /**
   * City of the salon address.
   */
  city: string;
  /**
   * Contact phone number for the salon.
   */
  phone: string;
}

export type CreateSalonResult = Salon;

const make = Effect.gen(function* () {
  const aggregate = yield* SalonAggregate;

  return {
    execute: (
      command: CreateSalonCommand,
    ): Effect.Effect<
      CreateSalonResult,
      InternalError | ConflictError | ValidationError
    > => aggregate.createSalon(command),
  };
});

/**
 * ### Command use case for creating a new salon.
 * Creates a new salon with the provided base data.
 *
 * - The provided salon name must be unique (case-insensitive) across all salons.
 */
export class CreateSalonUseCase extends Effect.Service<CreateSalonUseCase>()(
  "@repo/salon-domain/CreateSalonUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SalonAggregate.Default],
  },
) {}
