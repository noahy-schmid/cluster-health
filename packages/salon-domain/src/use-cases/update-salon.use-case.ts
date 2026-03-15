import { Effect } from "effect";
import {
  SalonAggregate,
  type Salon,
} from "../application/salon/salon.aggregate";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
} from "../application/salon/errors";

export interface UpdateSalonCommand {
  /**
   * The identifier of the salon to update.
   */
  salonId: string;
  /**
   * The new name of the salon. Must be unique (case-insensitive) across all salons, but can be the same as the current name of the salon.
   */
  name: string;
  /**
   * The new street address of the salon. Location existence is not validated.
   */
  street: string;
  /**
   * New postal code of the salon address.
   */
  postalCode: string;
  /**
   * New city of the salon address.
   */
  city: string;
  /**
   * New contact phone number for the salon.
   */
  phone: string;
}

export type UpdateSalonResult = Salon;

const make = Effect.gen(function* () {
  const aggregate = yield* SalonAggregate;

  return {
    execute: (
      command: UpdateSalonCommand,
    ): Effect.Effect<
      UpdateSalonResult,
      InternalError | NotFoundError | ConflictError | ValidationError
    > =>
      aggregate.updateSalon(command.salonId, {
        name: command.name,
        street: command.street,
        postalCode: command.postalCode,
        city: command.city,
        phone: command.phone,
      }),
  };
});

/**
 * ### Command use case for updating salon base data.
 * Updates salon base data by its identifier.
 *
 * - The salon name can be updated, but must be unique (case-insensitive) across all salons.
 */
export class UpdateSalonUseCase extends Effect.Service<UpdateSalonUseCase>()(
  "@repo/salon-domain/UpdateSalonUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SalonAggregate.Default],
  },
) {}
