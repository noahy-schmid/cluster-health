import { fetchSectionsBySalonSlug } from "@/api/sections-actions";
import { fetchHeroSettingsBySalonSlug } from "@/api/hero-actions";
import SectionRenderer from "@/components/sections/SectionRenderer";
import StickyMenuBar, { MenuItem } from "@/components/sticky-menu-bar";
import Hero from "./Hero";

function sluggify(text: string) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export default async function SalonPage({
  params,
}: {
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;

  // Fetch sections and hero settings from the database
  const [sectionsResult, heroResult] = await Promise.all([
    fetchSectionsBySalonSlug(salonSlug),
    fetchHeroSettingsBySalonSlug(salonSlug),
  ]);

  if (!sectionsResult.success) {
    return (
      <div className="container mx-auto px-md py-lg">
        <p className="text-destructive">
          {sectionsResult.errors || "Failed to load sections"}
        </p>
      </div>
    );
  }

  const { data } = sectionsResult;

  const menuItems: MenuItem[] =
    data
      ?.filter((section) => section.menuTitle)
      .map((section) => ({
        id: sluggify(section.menuTitle!),
        text: section.menuTitle!,
      })) || [];

  if (data.length === 0) {
    return (
      <div className="container mx-auto px-md py-lg">
        <p className="text-muted-foreground">No sections available yet.</p>
      </div>
    );
  }

  return (
    <>
      <Hero salonSlug={salonSlug} />

      <StickyMenuBar
        menuItems={menuItems}
        logoUrl={
          heroResult.success && heroResult.settings
            ? heroResult.settings.logo
            : "/images/logo.png"
        }
      />

      <div className="w-full bg-salon-bg-base">
        {data.map((section, index) => (
          <div
            key={section.id}
            id={sluggify(section.menuTitle || `section-${index + 1}`)}
          >
            <SectionRenderer
              section={section}
              order={index}
              salonSlug={salonSlug}
            />
          </div>
        ))}
      </div>
    </>
  );
}
