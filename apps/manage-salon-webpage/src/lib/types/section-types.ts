import { SectionType } from "@repo/website-database";

// Settings for Hero section (Start)
export interface HeroSettings {
  backgroundImageUrl: string;
  logoImageUrl: string;
  title: string;
  subtitle: string;
}

export interface SectionTypeInfo {
  type: SectionType;
  label: string;
  description: string;
  icon: string;
}
