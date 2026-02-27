import { create } from "zustand";
import { Reservation, CreateReservationData } from "@/lib/types/reservation";

// Mock storage for reservations
const reservationsStore = new Map<string, Reservation>();

// Generate a unique reservation ID
function generateReservationId(): string {
  return `RES-${Date.now()}-${Math.random().toString(36).substring(2, 9).toUpperCase()}`;
}

// Zustand store for managing reservation state
interface ReservationStore {
  currentReservation: Reservation | null;
  setCurrentReservation: (reservation: Reservation | null) => void;
}

export const useReservationStore = create<ReservationStore>((set) => ({
  currentReservation: null,
  setCurrentReservation: (reservation) =>
    set({ currentReservation: reservation }),
}));

// Create a new reservation
export async function createReservation(
  data: CreateReservationData,
): Promise<string> {
  const reservationId = generateReservationId();

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation

  const reservation: Reservation = {
    id: reservationId,
    staffId: data.staffId,
    staffName: data.staffName,
    service: data.service,
    date: data.date,
    time: data.time,
    price: data.price,
    duration: data.duration,
    createdAt: new Date(),
    status: "pending",
  };

  // Store in mock backend
  reservationsStore.set(reservationId, reservation);

  return reservationId;
}

// Retrieve a reservation by ID
export function getReservation(reservationId: string): Reservation | null {
  const reservation = reservationsStore.get(reservationId);
  return reservation || null;
}

// Update reservation with user details
export async function updateReservationUserDetails(
  reservationId: string,
  userDetails: {
    userEmail: string;
    userName: string;
    userPhone?: string;
  },
): Promise<boolean> {
  const reservation = reservationsStore.get(reservationId);

  await new Promise((resolve) => setTimeout(resolve, 1000)); // Simulate async operation

  if (!reservation) {
    return false;
  }

  const updatedReservation: Reservation = {
    ...reservation,
    ...userDetails,
  };

  reservationsStore.set(reservationId, updatedReservation);
  return true;
}

// Cancel a reservation
export function cancelReservation(reservationId: string): boolean {
  const reservation = reservationsStore.get(reservationId);

  if (!reservation) {
    return false;
  }

  const updatedReservation: Reservation = {
    ...reservation,
    status: "cancelled",
  };

  reservationsStore.set(reservationId, updatedReservation);
  return true;
}

// Confirm a reservation
export function confirmReservation(reservationId: string): boolean {
  const reservation = reservationsStore.get(reservationId);

  if (!reservation) {
    return false;
  }

  const updatedReservation: Reservation = {
    ...reservation,
    status: "confirmed",
  };

  reservationsStore.set(reservationId, updatedReservation);
  return true;
}
