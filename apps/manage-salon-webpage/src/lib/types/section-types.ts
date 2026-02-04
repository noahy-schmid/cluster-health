export type SectionType = "text-with-image" | "gallery";

// Settings for Hero section (Start)
export interface HeroSettings {
  backgroundImageUrl: string;
  logoImageUrl: string;
  title: string;
  subtitle: string;
}

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

// Discriminated union for sections based on type
export type Section =
  | {
      id: string;
      type: "text-with-image";
      settings: TextWithImageSettings;
      order: number;
      menuTitle: string | undefined;
    }
  | {
      id: string;
      type: "gallery";
      settings: GallerySettings;
      order: number;
      menuTitle: string | undefined;
    };

export interface SectionTypeInfo {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
}
