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
  salonId: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
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

export class UpdateSalonUseCase extends Effect.Service<UpdateSalonUseCase>()(
  "@repo/salon-domain/UpdateSalonUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SalonAggregate.Default],
  },
) {}
