import { Section } from "@/api/sections-actions";
import ImageTextSection from "../homepage-sections/image-text-section";
import ImageCarouselSection from "../homepage-sections/image-carousel-section";

interface SectionRendererProps {
  section: Section;
  order: number;
}

export default function SectionRenderer({
  section,
  order,
}: SectionRendererProps) {
  switch (section.type) {
    case "text-with-image":
      return (
        <ImageTextSection
          header={section.settings.title}
          text={section.settings.text}
          imageSrc={section.settings.imageUrl}
          imageAlt={section.settings.title}
          swapOrder={order % 2 === 1}
        />
      );
    case "gallery":
      return (
        <ImageCarouselSection
          images={section.settings.imageUrls}
          title={section.settings.title}
          subtitle={section.settings.subtitle}
        />
      );
    default:
      return null;
  }
}
