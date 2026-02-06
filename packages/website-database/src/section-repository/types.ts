export type SectionType = "text-with-image" | "gallery" | "reason";

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

type TypeToSettings = {
  "text-with-image": TextWithImageSettings;
  gallery: GallerySettings;
  reason: ReasonSettings;
};

export type Section<T extends SectionType> = {
  id: string;
  order: number;
  menuTitle: string | undefined;
  type: T;
  settings: TypeToSettings[T];
};

export type AllSections = { [K in SectionType]: Section<K> }[SectionType];
