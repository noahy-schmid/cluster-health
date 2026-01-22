// Types for staff members
export interface StaffMemberBasic {
  id: string;
  name: string;
  role: string;
  imageSrc: string;
  description: string;
}

export interface StaffMemberDetailed extends StaffMemberBasic {
  longDescription: string;
  specialties: string[];
  experience: string;
  rating: number;
  reviewCount: number;
  services: {
    name: string;
    duration: string;
    price: string;
  }[];
}

export interface ServiceAvailability {
  date: Date;
  times: string[];
}
