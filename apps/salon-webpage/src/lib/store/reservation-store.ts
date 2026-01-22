import { create } from "zustand";
import { Reservation } from "../types/reservation";

interface ReservationStore {
  reservations: Map<string, Reservation>;
  getReservationById: (id: string) => Reservation | undefined;
  addReservation: (reservation: Reservation) => void;
  updateReservation: (id: string, data: Partial<Reservation>) => void;
}

export const useReservationStore = create<ReservationStore>((set, get) => ({
  reservations: new Map(),

  getReservationById: (id: string) => {
    return get().reservations.get(id);
  },

  addReservation: (reservation: Reservation) => {
    set((state) => {
      const newReservations = new Map(state.reservations);
      newReservations.set(reservation.id, reservation);
      return { reservations: newReservations };
    });
  },

  updateReservation: (id: string, data: Partial<Reservation>) => {
    set((state) => {
      const newReservations = new Map(state.reservations);
      const existing = newReservations.get(id);
      if (existing) {
        newReservations.set(id, { ...existing, ...data });
      }
      return { reservations: newReservations };
    });
  },
}));
