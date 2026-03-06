"use server";

import {
  CreateStylistInput,
  Stylist,
  StylistService,
  StylistServiceLive,
  UpdateStylistInput,
} from "@repo/salon-domain";
import { SalonAccessGuard } from "@/api/guards/salon.guard";
import { Effect, Option } from "effect";
import { StylistDto } from "./stylist.dto";

interface CreateStylistInputDto {
  salonId: string;
  name: string;
  subtitle: string;
  description: string;
  profileImageMediaId?: string;
}

interface UpdateStylistInputDto {
  name: string;
  subtitle: string;
  description: string;
  profileImageMediaId?: string;
}

function serializeStylist(stylist: Stylist): StylistDto {
  return {
    id: stylist.id,
    createdAt: stylist.createdAt.toISOString(),
    updatedAt: stylist.updatedAt.toISOString(),
    salonId: stylist.salonId,
    name: stylist.name,
    subtitle: stylist.subtitle,
    description: stylist.description,
    profileImageMediaId: Option.getOrUndefined(stylist.profileImageMediaId),
  };
}

/**
 * Server action to create a new stylist
 * Takes salonId and stylist details, returns the created stylist with generated ID
 */
export async function createStylist(input: CreateStylistInputDto) {
  const access = await SalonAccessGuard.canAccessSalon(input.salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const createStylistInput: CreateStylistInput = {
    ...input,
    profileImageMediaId: input.profileImageMediaId
      ? Option.some(input.profileImageMediaId)
      : Option.none(),
  };

  const program = Effect.gen(function* () {
    const stylistService = yield* StylistService;
    return yield* stylistService
      .createStylist(createStylistInput)
      .pipe(
        Effect.map((stylist) => ({
          success: true as const,
          data: serializeStylist(stylist),
        })),
      );
  }).pipe(
    Effect.catchTags({
      StylistValidationError: (error) =>
        Effect.succeed({ success: false, error: error.message }),
      StylistDatabaseError: (error) =>
        Effect.succeed({ success: false, error: error.message }),
    }),
    Effect.provide(StylistServiceLive),
  );

  return await Effect.runPromise(program);
}

/**
 * Server action to fetch all stylists for a salon
 */
export async function fetchStylists(
  salonId: string,
): Promise<
  { success: true; data: StylistDto[] } | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const stylistService = yield* StylistService;
    return yield* stylistService
      .getStylistsBySalonId(salonId)
      .pipe(
        Effect.map((stylists) => ({
          success: true as const,
          data: stylists.map(serializeStylist),
        })),
      );
  }).pipe(
    Effect.catchTags({
      StylistDatabaseError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(StylistServiceLive),
  );

  return await Effect.runPromise(program);
}

/**
 * Server action to fetch a single stylist by ID
 */
export async function fetchStylist(
  salonId: string,
  stylistId: string,
): Promise<
  { success: true; data: StylistDto } | { success: false; error: string }
> {
  const access = await SalonAccessGuard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const program = Effect.gen(function* () {
    const stylistService = yield* StylistService;
    const stylist = yield* stylistService.getStylistById(stylistId);
    if (stylist.salonId !== salonId) {
      return {
        success: false as const,
        error: "Stylist gehört nicht zu diesem Salon",
      };
    }
    return { success: true as const, data: serializeStylist(stylist) };
  }).pipe(
    Effect.catchTags({
      StylistNotFoundError: (error) =>
        Effect.succeed({
          success: false as const,
          error:
            error.stylistId != null
              ? `${error.message} (Stylist ID: ${error.stylistId})`
              : error.message,
        }),
      StylistDatabaseError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(StylistServiceLive),
  );

  return Effect.runPromise(program);
}

/**
 * Server action to update an existing stylist
 */
export async function updateStylist(
  salonId: string,
  stylistId: string,
  updates: UpdateStylistInputDto,
) {
  const access = await SalonAccessGuard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false as const, error: access.error };
  }

  const updateStylistInput: UpdateStylistInput = {
    ...updates,
    profileImageMediaId: updates.profileImageMediaId
      ? Option.some(updates.profileImageMediaId)
      : Option.none(),
  };

  const program = Effect.gen(function* () {
    const stylistService = yield* StylistService;
    const stylist = yield* stylistService.getStylistById(stylistId);
    if (stylist.salonId !== salonId) {
      return {
        success: false as const,
        error: "Stylist gehört nicht zu diesem Salon",
      };
    }
    const updatedStylist = yield* stylistService.updateStylist(
      stylistId,
      updateStylistInput,
    );
    return { success: true as const, data: serializeStylist(updatedStylist) };
  }).pipe(
    Effect.catchTags({
      StylistNotFoundError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      StylistDatabaseError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
      StylistValidationError: (error) =>
        Effect.succeed({ success: false as const, error: error.message }),
    }),
    Effect.provide(StylistServiceLive),
  );

  return Effect.runPromise(program);
}

/**
 * Server action to delete a stylist
 */
export async function deleteStylist(salonId: string, stylistId: string) {
  const access = await SalonAccessGuard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false as const, error: access.error };
  }

  const program = Effect.gen(function* () {
    const stylistService = yield* StylistService;
    const stylist = yield* stylistService.getStylistById(stylistId);
    if (stylist.salonId !== salonId) {
      return {
        success: false as const,
        error: "Stylist gehört nicht zu diesem Salon",
      };
    }
    yield* stylistService.deleteStylist(stylistId);
    return { success: true as const };
  }).pipe(
    Effect.catchTags({
      StylistNotFoundError: (error) =>
        Effect.succeed({ success: false, error: error.message }),
      StylistDatabaseError: (error) =>
        Effect.succeed({ success: false, error: error.message }),
    }),
    Effect.provide(StylistServiceLive),
  );

  return Effect.runPromise(program);
}
