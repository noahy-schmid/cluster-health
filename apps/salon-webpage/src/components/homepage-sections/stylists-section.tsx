import { StylistsSettings } from "@repo/website-domain";
import {
  fetchStylistsBySalonSlug,
  StylistWithImageUrl,
} from "@/api/stylists-actions";
import StylistsSlider from "./stylists-slider";

interface StylistsSectionProps {
  settings: StylistsSettings;
  salonSlug: string;
}

export default async function StylistsSection({
  settings,
  salonSlug,
}: StylistsSectionProps) {
  // Fetch stylists from the database
  const result = await fetchStylistsBySalonSlug(salonSlug);

  // If no stylists or error, show message
  if (!result.success || !result.stylists || result.stylists.length === 0) {
    return (
      <section className="px-4 py-8 max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-4xl font-semibold text-salon-fg-strong">
            {settings.title}
          </h2>
          <p className="text-base font-light text-salon-fg-base">
            {settings.subtitle}
          </p>
        </div>
        <p className="text-center text-salon-fg-muted">
          {result.error || "Keine Stylisten verfügbar"}
        </p>
      </section>
    );
  }

  // Map stylists to the format expected by StylistsSlider
  const stylists = result.stylists.map((stylist: StylistWithImageUrl) => ({
    id: stylist.id,
    name: stylist.name,
    role: stylist.subtitle,
    imageSrc: stylist.profileImageUrl,
  }));

  return (
    <section className="py-16">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className="text-4xl font-semibold text-salon-fg-strong mb-4">
            {settings.title}
          </h2>
          <p className="text-base font-light text-salon-fg-base">
            {settings.subtitle}
          </p>
        </div>
      </div>
      <StylistsSlider stylists={stylists} />
    </section>
  );
}
