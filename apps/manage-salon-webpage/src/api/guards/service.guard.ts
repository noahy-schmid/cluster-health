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
      return { salonId: service.salonId, error: null };
    }).pipe(
      Effect.catchTags({
        NotFoundError: () =>
          Effect.succeed({
            salonId: null as string | null,
            error: "Dienstleistung nicht gefunden",
          }),
        InternalError: (e) =>
          Effect.succeed({
            salonId: null as string | null,
            error: e.message,
          }),
      }),
      Effect.provide(GetServiceDefinitionUseCaseLayer),
    );

    const result = await Effect.runPromise(program);
    if (!result.salonId) {
      return { success: false, error: result.error! };
    }

    const access = await SalonAccessGuard.canAccessSalon(result.salonId);
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
      return { salonId: service.salonId, error: null };
    }).pipe(
      Effect.catchTags({
        NotFoundError: () =>
          Effect.succeed({
            salonId: null as string | null,
            error: "Dienstleistung nicht gefunden",
          }),
        InternalError: (e) =>
          Effect.succeed({
            salonId: null as string | null,
            error: e.message,
          }),
      }),
      Effect.provide(GetServiceDefinitionUseCaseLayer),
    );

    const result = await Effect.runPromise(program);
    if (!result.salonId) {
      return { success: false, error: result.error! };
    }

    const access = await SalonAccessGuard.canAccessSalon(result.salonId);
    if (!access.success) {
      return { success: false, error: access.error };
    }
    return { success: true, salonId: result.salonId };
  },
};
