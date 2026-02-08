export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; errors: E };

export type Salon = {
  id: string;
  name: string;
  street: string;
  postalCode: string;
  city: string;
  phone: string;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSalonInput = Omit<Salon, "id" | "createdAt" | "updatedAt">;

export type UpdateSalonInput = Omit<Salon, "id" | "createdAt" | "updatedAt">;
