export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; errors: E };

export type ManagementUser = {
  id: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
  salonId: string;
};

export type ManagementUserRole = "admin" | `employee_${string}`;

export type ManagementAuthTokenPayload = {
  userId: string;
  salonId: string;
  roles: ManagementUserRole[];
};
