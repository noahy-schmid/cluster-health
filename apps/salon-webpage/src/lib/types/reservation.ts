// Types for reservations
export interface Reservation {
  id: string;
  staffId: string;
  staffName: string;
  service: string;
  date: Date;
  time: string;
  price: string;
  duration: string;
  createdAt: Date;
  // User details will be added later for email verification
  userEmail?: string;
  userName?: string;
  userPhone?: string;
  status: "pending" | "confirmed" | "cancelled";
}

export interface CreateReservationData {
  staffId: string;
  staffName: string;
  service: string;
  date: Date;
  time: string;
  price: string;
  duration: string;
}
