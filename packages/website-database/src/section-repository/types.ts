export type SectionType = "text-with-image" | "gallery";

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

type TypeToSettings = {
  "text-with-image": TextWithImageSettings;
  gallery: GallerySettings;
};

export type Section<T extends SectionType> = {
  id: string;
  order: number;
  menuTitle: string | undefined;
  type: T;
  settings: TypeToSettings[T];
};

export type AllSections = { [K in SectionType]: Section<K> }[SectionType];
