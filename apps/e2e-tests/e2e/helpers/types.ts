export type ManagementAccount = {
  email: string;
  password: string;
};

export type SalonState = {
  salonId: string;
  name: string;
};

export type WebsiteState = {
  websiteId: string;
  slug: string;
  title: string;
  publicUrl: string;
};

export type CenterTextSectionState = {
  sectionId: string;
  menuTitle: string;
  title: string;
  content: string;
};

export type StylistsSectionState = {
  sectionId: string;
  menuTitle: string;
  title: string;
  subtitle: string;
};

export type StylistState = {
  name: string;
  subtitle: string;
  description: string;
  profileImagePath?: string;
};

export type WebsiteInput = {
  slug?: string;
  title?: string;
};

export type CenterTextInput = {
  menuTitle?: string;
  title?: string;
  content?: string;
};

export type StylistsSectionInput = {
  menuTitle?: string;
  title?: string;
  subtitle?: string;
};

export type StylistInput = {
  name?: string;
  subtitle?: string;
  description?: string;
  profileImagePath?: string;
};

export type OpeningHoursInput = {
  /** YYYY-MM-DD */
  date: string;
  isOpen: boolean;
  openTime?: string;
  closeTime?: string;
};

export type OpeningHoursState = {
  date: string;
  isOpen: boolean;
  openTime: string | null;
  closeTime: string | null;
  /** "exception" = date-specific override; "weekly" = recurring weekday rule */
  appliedAs: "exception" | "weekly";
};
