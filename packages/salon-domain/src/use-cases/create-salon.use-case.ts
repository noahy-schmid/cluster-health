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
  name: string;
  street: string;
  postalCode: string;
  city: string;
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

export class CreateSalonUseCase extends Effect.Service<CreateSalonUseCase>()(
  "@repo/salon-domain/CreateSalonUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SalonAggregate.Default],
  },
) {}
