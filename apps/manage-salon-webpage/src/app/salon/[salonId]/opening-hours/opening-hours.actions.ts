"use server";

import { Effect } from "effect";
import { SalonAccessGuard } from "@/api/guards/salon.guard";
import {
  SetSalonOpeningHoursUseCase,
  SetSalonOpeningHoursUseCaseLayer,
  DeleteSalonOpeningHoursUseCase,
  DeleteSalonOpeningHoursUseCaseLayer,
  ListSalonOpeningHoursUseCase,
  ListSalonOpeningHoursUseCaseLayer,
  CreateSalonOpeningHoursExceptionUseCase,
  CreateSalonOpeningHoursExceptionUseCaseLayer,
  DeleteSalonOpeningHoursExceptionUseCase,
  DeleteSalonOpeningHoursExceptionUseCaseLayer,
  ListSalonOpeningHoursExceptionsUseCase,
  ListSalonOpeningHoursExceptionsUseCaseLayer,
  type OpeningHours,
  type OpeningHoursException,
} from "@repo/salon-domain";

// --- DTOs (serialisable across the server/client boundary) ---

export interface OpeningHoursDto {
  id: string;
  salonId: string;
  dayOfWeek: number;
  openTime: string;
  closeTime: string;
  createdAt: string;
  updatedAt: string;
}

export interface OpeningHoursExceptionDto {
  id: string;
  salonId: string;
  date: string;
  isClosed: boolean;
  openTime: string | null;
  closeTime: string | null;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
}

function serializeOpeningHours(oh: OpeningHours): OpeningHoursDto {
  return {
    id: oh.id,
    salonId: oh.salonId,
    dayOfWeek: oh.dayOfWeek,
    openTime: oh.openTime,
    closeTime: oh.closeTime,
    createdAt: oh.createdAt.toISOString(),
    updatedAt: oh.updatedAt.toISOString(),
  };
}

function serializeException(
  ex: OpeningHoursException,
): OpeningHoursExceptionDto {
  return {
    id: ex.id,
    salonId: ex.salonId,
    date: ex.date,
    isClosed: ex.isClosed,
    openTime: ex.openTime,
    closeTime: ex.closeTime,
    reason: ex.reason,
    createdAt: ex.createdAt.toISOString(),
    updatedAt: ex.updatedAt.toISOString(),
  };
}

// --- Actions ---

export async function fetchOpeningHours(
  salonId: string,
): Promise<
  { success: true; data: OpeningHoursDto[] } | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* ListSalonOpeningHoursUseCase;
    const result = yield* useCase.execute({ salonId });
    return { success: true as const, data: result.map(serializeOpeningHours) };
  }).pipe(
    Effect.catchTag("OpeningHoursInternalError", (e) =>
      Effect.succeed({ success: false as const, error: e.message }),
    ),
    Effect.provide(ListSalonOpeningHoursUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function setOpeningHours(
  salonId: string,
  dayOfWeek: number,
  openTime: string,
  closeTime: string,
): Promise<
  { success: true; data: OpeningHoursDto } | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* SetSalonOpeningHoursUseCase;
    const result = yield* useCase.execute({
      salonId,
      dayOfWeek,
      openTime,
      closeTime,
    });
    return { success: true as const, data: serializeOpeningHours(result) };
  }).pipe(
    Effect.catchTags({
      OpeningHoursValidationError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      OpeningHoursInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      NotFoundError: (e) =>
        Effect.succeed({
          success: false as const,
          error: `${e.entity} nicht gefunden`,
        }),
    }),
    Effect.provide(SetSalonOpeningHoursUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function deleteOpeningHours(
  salonId: string,
  dayOfWeek: number,
): Promise<{ success: true } | { success: false; error: string }> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* DeleteSalonOpeningHoursUseCase;
    yield* useCase.execute({ salonId, dayOfWeek });
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      OpeningHoursValidationError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      OpeningHoursInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
    }),
    Effect.provide(DeleteSalonOpeningHoursUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function fetchOpeningHoursExceptions(
  salonId: string,
): Promise<
  | { success: true; data: OpeningHoursExceptionDto[] }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* ListSalonOpeningHoursExceptionsUseCase;
    const result = yield* useCase.execute({ salonId });
    return { success: true as const, data: result.map(serializeException) };
  }).pipe(
    Effect.catchTag("OpeningHoursInternalError", (e) =>
      Effect.succeed({ success: false as const, error: e.message }),
    ),
    Effect.provide(ListSalonOpeningHoursExceptionsUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function createOpeningHoursException(
  salonId: string,
  date: string,
  isClosed: boolean,
  openTime?: string | null,
  closeTime?: string | null,
  reason?: string | null,
): Promise<
  | { success: true; data: OpeningHoursExceptionDto }
  | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* CreateSalonOpeningHoursExceptionUseCase;
    const result = yield* useCase.execute({
      salonId,
      date,
      isClosed,
      openTime,
      closeTime,
      reason,
    });
    return { success: true as const, data: serializeException(result) };
  }).pipe(
    Effect.catchTags({
      OpeningHoursValidationError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      OpeningHoursInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
      NotFoundError: (e) =>
        Effect.succeed({
          success: false as const,
          error: `${e.entity} nicht gefunden`,
        }),
    }),
    Effect.provide(CreateSalonOpeningHoursExceptionUseCaseLayer),
  );

  return Effect.runPromise(program);
}

export async function deleteOpeningHoursException(
  salonId: string,
  id: string,
): Promise<{ success: true } | { success: false; error: string }> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);
  if (!access.success) return { success: false, error: access.error };

  const program = Effect.gen(function* () {
    const useCase = yield* DeleteSalonOpeningHoursExceptionUseCase;
    yield* useCase.execute({ id });
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      OpeningHoursNotFoundError: () =>
        Effect.succeed({
          success: false as const,
          error: "Ausnahme nicht gefunden",
        }),
      OpeningHoursInternalError: (e) =>
        Effect.succeed({ success: false as const, error: e.message }),
    }),
    Effect.provide(DeleteSalonOpeningHoursExceptionUseCaseLayer),
  );

  return Effect.runPromise(program);
}
