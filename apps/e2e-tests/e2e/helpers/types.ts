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

export type WebsiteInput = {
  slug?: string;
  title?: string;
};

export type CenterTextInput = {
  position?: number;
  menuTitle?: string;
  title?: string;
  content?: string;
};
