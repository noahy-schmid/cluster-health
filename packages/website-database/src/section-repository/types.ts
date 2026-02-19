export type Result<T, E> =
  | { success: true; data: T }
  | { success: false; errors: E };

export type SectionType =
  | "text-with-image"
  | "gallery"
  | "center-text"
  | "reason"
  | "stylists-section";

// Settings for Text with Image section
export interface TextWithImageSettings {
  imageUrl: string;
  title: string;
  text: string;
}

// Settings for Gallery section
export interface GallerySettings {
  title: string;
  subtitle: string;
  imageUrls: string[];
}

export interface CenterTextSettings {
  title: string;
  content: string;
}

// Settings for Reason section
export interface ReasonItem {
  title: string;
  description: string;
  imageUrl?: string;
}

export interface ReasonSettings {
  title: string;
  subtitle: string;
  items: ReasonItem[];
}

// Settings for Stylists section
export interface StylistsSettings {
  title: string;
  subtitle: string;
}

type TypeToSettings = {
  "text-with-image": TextWithImageSettings;
  gallery: GallerySettings;
  "center-text": CenterTextSettings;
  reason: ReasonSettings;
  "stylists-section": StylistsSettings;
};

export type Section<T extends SectionType> = {
  id: string;
  order: number;
  menuTitle: string | undefined;
  type: T;
  settings: TypeToSettings[T];
};

export type AllSections = { [K in SectionType]: Section<K> }[SectionType];
