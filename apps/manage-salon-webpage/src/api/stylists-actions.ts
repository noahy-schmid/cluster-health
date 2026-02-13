"use server";

import {
  StylistRepository,
  CreateStylistInput,
  UpdateStylistInput,
} from "@repo/salon-domain";
import { SalonAccessGuard } from "@/api/guards/salon-access-guard";

/**
 * Server action to create a new stylist
 * Takes salonId and stylist details, returns the created stylist with generated ID
 */
export async function createStylist(input: CreateStylistInput) {
  const guard = new SalonAccessGuard();
  const access = await guard.canAccessSalon(input.salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const repository = new StylistRepository();
  const result = await repository.createStylist(input);

  if (!result.success) {
    return { success: false, error: result.errors };
  }

  return { success: true, stylist: result.data };
}

/**
 * Server action to fetch all stylists for a salon
 */
export async function fetchStylists(salonId: string) {
  const guard = new SalonAccessGuard();
  const access = await guard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const repository = new StylistRepository();
  const result = await repository.fetchStylistsBySalonId(salonId);

  if (!result.success) {
    return { success: false, error: result.errors };
  }

  return { success: true, stylists: result.data };
}

/**
 * Server action to fetch a single stylist by ID
 */
export async function fetchStylist(salonId: string, stylistId: string) {
  const guard = new SalonAccessGuard();
  const access = await guard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const repository = new StylistRepository();
  const result = await repository.fetchStylistById(stylistId);

  if (!result.success) {
    return { success: false, error: result.errors };
  }

  // Verify the stylist belongs to the salon
  if (result.data.salonId !== salonId) {
    return {
      success: false,
      error: "Stylist gehört nicht zu diesem Salon",
    };
  }

  return { success: true, stylist: result.data };
}

/**
 * Server action to update an existing stylist
 */
export async function updateStylist(
  salonId: string,
  stylistId: string,
  updates: UpdateStylistInput,
) {
  const guard = new SalonAccessGuard();
  const access = await guard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const repository = new StylistRepository();

  // First verify the stylist belongs to this salon
  const fetchResult = await repository.fetchStylistById(stylistId);
  if (!fetchResult.success) {
    return { success: false, error: fetchResult.errors };
  }

  if (fetchResult.data.salonId !== salonId) {
    return {
      success: false,
      error: "Stylist gehört nicht zu diesem Salon",
    };
  }

  const result = await repository.updateStylist(stylistId, updates);

  if (!result.success) {
    return { success: false, error: result.errors };
  }

  return { success: true, stylist: result.data };
}

/**
 * Server action to delete a stylist
 */
export async function deleteStylist(salonId: string, stylistId: string) {
  const guard = new SalonAccessGuard();
  const access = await guard.canAccessSalon(salonId);

  if (!access.success) {
    return { success: false, error: access.error };
  }

  const repository = new StylistRepository();

  // First verify the stylist belongs to this salon
  const fetchResult = await repository.fetchStylistById(stylistId);
  if (!fetchResult.success) {
    return { success: false, error: fetchResult.errors };
  }

  if (fetchResult.data.salonId !== salonId) {
    return {
      success: false,
      error: "Stylist gehört nicht zu diesem Salon",
    };
  }

  const result = await repository.deleteStylist(stylistId);

  if (!result.success) {
    return { success: false, error: result.errors };
  }

  return { success: true };
}
