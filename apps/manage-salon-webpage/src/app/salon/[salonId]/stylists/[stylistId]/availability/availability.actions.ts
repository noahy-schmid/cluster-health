"use server";

import { Effect } from "effect";
import { SalonAccessGuard } from "@/api/guards/salon.guard";
import {
  SetStylistAvailabilityUseCase,
  SetStylistAvailabilityUseCaseLayer,
  DeleteStylistAvailabilityUseCase,
  DeleteStylistAvailabilityUseCaseLayer,
  ListStylistAvailabilityUseCase,
  ListStylistAvailabilityUseCaseLayer,
  CreateStylistAvailabilityExceptionUseCase,
  CreateStylistAvailabilityExceptionUseCaseLayer,
  DeleteStylistAvailabilityExceptionUseCase,
  DeleteStylistAvailabilityExceptionUseCaseLayer,
  ListStylistAvailabilityExceptionsUseCase,
  ListStylistAvailabilityExceptionsUseCaseLayer,
  type StylistAvailability,
  type StylistAvailabilityException,
} from "@repo/salon-domain";

// --- DTOs ---

export interface StylistAvailabilityDto {
  id: string;
  stylistId: string;
  salonId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface StylistAvailabilityExceptionDto {
  id: string;
  stylistId: string;
  salonId: string;
  date: string;
  isAbsent: boolean;
  startTime: string | null;
  endTime: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

function serializeAvailability(
  av: StylistAvailability,
): StylistAvailabilityDto {
  return {
    id: av.id,
    stylistId: av.stylistId,
    salonId: av.salonId,
    dayOfWeek: av.dayOfWeek,
    startTime: av.startTime,
    endTime: av.endTime,
    createdAt: av.createdAt.toISOString(),
    updatedAt: av.updatedAt.toISOString(),
  };
}

function serializeException(
  ex: StylistAvailabilityException,
): StylistAvailabilityExceptionDto {
  return {
    id: ex.id,
    stylistId: ex.stylistId,
    salonId: ex.salonId,
    date: ex.date,
    isAbsent: ex.isAbsent,
    startTime: ex.startTime,
    endTime: ex.endTime,
    reason: ex.reason,
    createdAt: ex.createdAt.toISOString(),
    updatedAt: ex.updatedAt.toISOString(),
  };
}

// --- Actions ---

export async function fetchStylistAvailability(
  salonId: string,
  stylistId: string,
): Promise<
  | { success: true; data: StylistAvailabilityDto[] }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* ListStylistAvailabilityUseCase;
    const result = yield* useCase.execute({ stylistId });
    return {
      success: true as const,
      data: result.map(serializeAvailability),
    };
  }).pipe(
    Effect.catchTag("StylistAvailabilityInternalError", (e) =>
      Effect.succeed({ success: false as const, error: e.message }),
    ),
    Effect.provide(ListStylistAvailabilityUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function setStylistAvailability(
  salonId: string,
  stylistId: string,
  dayOfWeek: number,
  startTime: string,
  endTime: string,
): Promise<
  | { success: true; data: StylistAvailabilityDto }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* SetStylistAvailabilityUseCase;
    const result = yield* useCase.execute({
      stylistId,
      salonId,
      dayOfWeek,
      startTime,
      endTime,
    });
    return { success: true as const, data: serializeAvailability(result) };
  }).pipe(
    Effect.catchTags({
      StylistAvailabilityValidationError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      StylistAvailabilityInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      NotFoundError: (e) =>
        Effect.succeed({
          success: false as const,
          error: `${e.entity} nicht gefunden`,
        }),
    }),
    Effect.provide(SetStylistAvailabilityUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function deleteStylistAvailability(
  salonId: string,
  stylistId: string,
  dayOfWeek: number,
): Promise<{ success: true } | { success: false; error: string }> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* DeleteStylistAvailabilityUseCase;
    yield* useCase.execute({ stylistId, dayOfWeek });
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      StylistAvailabilityValidationError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      StylistAvailabilityInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
    }),
    Effect.provide(DeleteStylistAvailabilityUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function fetchStylistAvailabilityExceptions(
  salonId: string,
  stylistId: string,
): Promise<
  | { success: true; data: StylistAvailabilityExceptionDto[] }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* ListStylistAvailabilityExceptionsUseCase;
    const result = yield* useCase.execute({ stylistId });
    return { success: true as const, data: result.map(serializeException) };
  }).pipe(
    Effect.catchTag("StylistAvailabilityInternalError", (e) =>
      Effect.succeed({ success: false as const, error: e.message }),
    ),
    Effect.provide(ListStylistAvailabilityExceptionsUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function createStylistAvailabilityException(
  salonId: string,
  stylistId: string,
  date: string,
  isAbsent: boolean,
  startTime?: string | null,
  endTime?: string | null,
  reason?: string | null,
): Promise<
  | { success: true; data: StylistAvailabilityExceptionDto }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* CreateStylistAvailabilityExceptionUseCase;
    const result = yield* useCase.execute({
      stylistId,
      salonId,
      date,
      isAbsent,
      startTime,
      endTime,
      reason,
    });
    return { success: true as const, data: serializeException(result) };
  }).pipe(
    Effect.catchTags({
      StylistAvailabilityValidationError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      StylistAvailabilityInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      NotFoundError: (e) =>
        Effect.succeed({
          success: false as const,
          error: `${e.entity} nicht gefunden`,
        }),
    }),
    Effect.provide(CreateStylistAvailabilityExceptionUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function deleteStylistAvailabilityException(
  salonId: string,
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* DeleteStylistAvailabilityExceptionUseCase;
    yield* useCase.execute({ id });
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      StylistAvailabilityNotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Ausnahme nicht gefunden",
        }),
      StylistAvailabilityInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
    }),
    Effect.provide(DeleteStylistAvailabilityExceptionUseCaseLayer),
  );

  return Effect.runPromise(program);
}
