import {
  StaffMemberBasic,
  StaffMemberDetailed,
  ServiceAvailability,
} from "../types/staff";
import { staffMembers } from "../data/staff-data";

/**
 * Service for fetching staff data
 * In a real application, these would be API calls
 */

/**
 * Get all staff members with basic information (for listing/slider)
 */
export async function getStaffMembers(): Promise<StaffMemberBasic[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  // Return only basic information
  return staffMembers.map(({ id, name, role, imageSrc, description }) => ({
    id,
    name,
    role,
    imageSrc,
    description,
  }));
}

/**
 * Get detailed information for a specific staff member by ID
 * Does NOT include availability - use getServiceAvailability for that
 */
export async function getStaffMemberById(
  id: string
): Promise<StaffMemberDetailed | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const member = staffMembers.find((s) => s.id === id);
  if (!member) return null;

  // Return detailed info WITHOUT availability
  return {
    id: member.id,
    name: member.name,
    role: member.role,
    imageSrc: member.imageSrc,
    description: member.description,
    longDescription: member.longDescription,
    specialties: member.specialties,
    experience: member.experience,
    rating: member.rating,
    reviewCount: member.reviewCount,
    services: member.services.map((service) => ({
      name: service.name,
      price: service.price,
      duration: service.duration,
    })),
  };
}

/**
 * Get availability for a specific service of a staff member
 * Must be called separately after selecting a service
 */
export async function getServiceAvailability(
  staffId: string,
  serviceName: string
): Promise<ServiceAvailability[] | null> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 100));

  const member = staffMembers.find((s) => s.id === staffId);
  if (!member) return null;

  const service = member.services.find((s) => s.name === serviceName);
  if (!service) return null;

  return service.availability;
}
