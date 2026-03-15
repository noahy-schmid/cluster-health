import { Effect } from "effect";
import {
  SalonAggregate,
  type Salon,
} from "../application/salon/salon.aggregate";
import { InternalError, NotFoundError } from "../application/salon/errors";

export interface GetSalonQuery {
  /**
   * The identifier of the salon to retrieve.
   */
  salonId: string;
}

export type GetSalonResult = Salon;

const make = Effect.gen(function* () {
  const aggregate = yield* SalonAggregate;

  return {
    execute: (
      query: GetSalonQuery,
    ): Effect.Effect<GetSalonResult, InternalError | NotFoundError> =>
      aggregate.getSalon(query.salonId),
  };
});

/**
 * ### Query use case for retrieving a salon by ID.
 */
export class GetSalonUseCase extends Effect.Service<GetSalonUseCase>()(
  "@repo/salon-domain/GetSalonUseCase",
  {
    effect: make,
    accessors: true,
    dependencies: [SalonAggregate.Default],
  },
) {}
