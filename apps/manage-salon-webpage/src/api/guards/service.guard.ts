import "server-only";

import { Effect } from "effect";
import {
  GetServiceDefinitionUseCase,
  GetServiceDefinitionUseCaseLayer,
} from "@repo/salon-domain";
import { SalonAccessGuard } from "./salon.guard";

export const ServiceGuard = {
  /**
   * Verifies the user can edit a service by looking up the service,
   * checking which salon it belongs to, and verifying salon access.
   */
  async canEditService(
    serviceId: string,
  ): Promise<{ success: true } | { success: false; error: string }> {
    const program = Effect.gen(function* () {
      const useCase = yield* GetServiceDefinitionUseCase;
      const service = yield* useCase.execute({ serviceId });
      return service.salonId;
    }).pipe(
      Effect.catchTags({
        NotFoundError: () => Effect.succeed(null),
        InternalError: () => Effect.succeed(null),
      }),
      Effect.provide(GetServiceDefinitionUseCaseLayer),
    );

    const salonId = await Effect.runPromise(program);
    if (!salonId) {
      return { success: false, error: "Dienstleistung nicht gefunden" };
    }

    const access = await SalonAccessGuard.canAccessSalon(salonId);
    if (!access.success) {
      return { success: false, error: access.error };
    }
    return { success: true };
  },

  /**
   * Verifies the user can access a service (read) by looking up the service,
   * checking which salon it belongs to, and verifying salon access.
   */
  async canAccessService(
    serviceId: string,
  ): Promise<
    { success: true; salonId: string } | { success: false; error: string }
  > {
    const program = Effect.gen(function* () {
      const useCase = yield* GetServiceDefinitionUseCase;
      const service = yield* useCase.execute({ serviceId });
      return service.salonId;
    }).pipe(
      Effect.catchTags({
        NotFoundError: () => Effect.succeed(null),
        InternalError: () => Effect.succeed(null),
      }),
      Effect.provide(GetServiceDefinitionUseCaseLayer),
    );

    const salonId = await Effect.runPromise(program);
    if (!salonId) {
      return { success: false, error: "Dienstleistung nicht gefunden" };
    }

    const access = await SalonAccessGuard.canAccessSalon(salonId);
    if (!access.success) {
      return { success: false, error: access.error };
    }
    return { success: true, salonId };
  },
};
