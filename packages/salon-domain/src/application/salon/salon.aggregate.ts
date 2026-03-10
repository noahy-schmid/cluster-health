import { Effect, Layer } from "effect";
import {
  SalonPort,
  type PortSalon,
  type PortCreateSalonInput,
  type PortUpdateSalonInput,
} from "../../ports/salon.port";
import {
  ConflictError,
  InternalError,
  NotFoundError,
  ValidationError,
} from "./errors";
import { DatabaseLayer } from "../../infrastructure/database.service";
import { ConfigurationLayer } from "../../infrastructure/config.service";
import { PostgresSalonPortAdapter } from "../../adapters/postgres-salon-port.adapter";

export type Salon = PortSalon;
export type CreateSalonInput = PortCreateSalonInput;
export type UpdateSalonInput = PortUpdateSalonInput;

const validateSalonInput = (
  input: CreateSalonInput | UpdateSalonInput,
): Effect.Effect<CreateSalonInput | UpdateSalonInput, ValidationError> =>
  Effect.gen(function* () {
    const name = input.name.trim();
    const street = input.street.trim();
    const postalCode = input.postalCode.trim();
    const city = input.city.trim();
    const phone = input.phone.trim();

    if (!name) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Salon name cannot be empty",
        }),
      );
    }

    if (!street) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Salon street cannot be empty",
        }),
      );
    }

    if (!postalCode) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Salon postal code cannot be empty",
        }),
      );
    }

    if (!city) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Salon city cannot be empty",
        }),
      );
    }

    if (!phone) {
      return yield* Effect.fail(
        new ValidationError({
          message: "Salon phone cannot be empty",
        }),
      );
    }

    return {
      name,
      street,
      postalCode,
      city,
      phone,
    };
  });

const make = Effect.gen(function* () {
  const salonPort = yield* SalonPort;

  const ensureNameIsAvailable = (name: string, currentSalonId?: string) =>
    Effect.gen(function* () {
      const existingSalon = yield* salonPort.findSalonByName(name).pipe(
        Effect.mapError(
          (error) =>
            new InternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );

      if (existingSalon && existingSalon.id !== currentSalonId) {
        return yield* Effect.fail(
          new ConflictError({
            message: "Salon name already exists",
          }),
        );
      }
    });

  const createSalon = (input: CreateSalonInput) =>
    Effect.gen(function* () {
      const validatedInput = yield* validateSalonInput(input);
      yield* ensureNameIsAvailable(validatedInput.name);

      return yield* salonPort.createSalon(validatedInput).pipe(
        Effect.mapError(
          (error) =>
            new InternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );
    });

  const getSalon = (salonId: string) =>
    Effect.gen(function* () {
      const salon = yield* salonPort.findSalonById(salonId).pipe(
        Effect.mapError(
          (error) =>
            new InternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );

      if (!salon) {
        return yield* Effect.fail(
          new NotFoundError({
            entity: "Salon",
            id: salonId,
          }),
        );
      }

      return salon;
    });

  const updateSalon = (salonId: string, input: UpdateSalonInput) =>
    Effect.gen(function* () {
      const existingSalon = yield* getSalon(salonId);
      const validatedInput = yield* validateSalonInput(input);
      yield* ensureNameIsAvailable(validatedInput.name, existingSalon.id);

      const updatedSalon = yield* salonPort.updateSalon(salonId, validatedInput).pipe(
        Effect.mapError(
          (error) =>
            new InternalError({
              message: error.message,
              cause: error,
            }),
        ),
      );

      if (!updatedSalon) {
        return yield* Effect.fail(
          new NotFoundError({
            entity: "Salon",
            id: salonId,
          }),
        );
      }

      return updatedSalon;
    });

  return {
    createSalon,
    getSalon,
    updateSalon,
  };
});

export class SalonAggregate extends Effect.Service<SalonAggregate>()(
  "@repo/salon-domain/SalonAggregate",
  {
    effect: make,
    accessors: true,
    dependencies: [
      PostgresSalonPortAdapter.pipe(
        Layer.provide(DatabaseLayer),
        Layer.provide(ConfigurationLayer),
        Layer.orDie,
      ),
    ],
  },
) {}
