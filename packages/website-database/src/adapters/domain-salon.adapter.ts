import { Effect, Layer } from "effect";
import { SalonRepository, type Result, type Salon } from "@repo/salon-domain";
import { SalonPort } from "../ports/salon.port";

/**
 * Adapter that implements SalonPort using the SalonRepository from salon-domain.
 */
const make = Effect.gen(function* () {
  yield* Effect.succeed(undefined);

  const salonRepository = new SalonRepository();

  const salonExists: SalonPort["salonExists"] = (salonId) =>
    Effect.gen(function* () {
      const result = (yield* Effect.promise(() =>
        salonRepository.fetchSalonById(salonId),
      )) as Result<Salon, string>;

      return result.success;
    });

  return {
    salonExists,
  } satisfies SalonPort;
});

/**
 * Layer that provides the SalonPort implementation using salon-domain.
 */
export const DomainSalonAdapter = Layer.effect(SalonPort, make);
