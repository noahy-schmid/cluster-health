import ImageTextSection from "../homepage-sections/image-text-section";
import ImageCarouselSection from "../homepage-sections/image-carousel-section";
import CenterTextSection from "../homepage-sections/center-text-section";
import { AllSections } from "@repo/website-database";

interface SectionRendererProps {
  section: AllSections;
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
    case "center-text":
      return <CenterTextSection settings={section.settings} />;
    default:
      return null;
  }
}
