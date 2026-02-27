import ImageTextSection from "../homepage-sections/image-text-section";
import ImageCarouselSection from "../homepage-sections/image-carousel-section";
import CenterTextSection from "../homepage-sections/center-text-section";
import ReasonSection from "../homepage-sections/reason-section";
import StylistsSection from "../homepage-sections/stylists-section";
import { AllSections } from "@repo/website-database";

interface SectionRendererProps {
  section: AllSections;
  order: number;
  salonSlug: string;
}

export default function SectionRenderer({
  section,
  order,
  salonSlug,
}: SectionRendererProps) {
  switch (section.type) {
    case "text-with-image":
      return (
        <ImageTextSection
          header={section.settings.title}
          text={section.settings.text}
          imageId={section.settings.imageId}
          imageAlt={section.settings.title}
          swapOrder={order % 2 === 1}
        />
      );
    case "gallery":
      return (
        <ImageCarouselSection
          imageIds={section.settings.imageIds}
          title={section.settings.title}
          subtitle={section.settings.subtitle}
        />
      );
    case "center-text":
      return <CenterTextSection settings={section.settings} />;
    case "reason":
      return <ReasonSection settings={section.settings} />;
    case "stylists-section":
      return (
        <StylistsSection settings={section.settings} salonSlug={salonSlug} />
      );
    default:
      return null;
  }
}
