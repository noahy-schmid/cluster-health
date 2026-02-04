import { fetchSectionsBySalonSlug } from "@/api/sections-actions";
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

  // Fetch sections from the database
  const { success, sections, error } =
    await fetchSectionsBySalonSlug(salonSlug);

  const menuItems: MenuItem[] =
    sections
      ?.filter((section) => section.menuTitle)
      .map((section) => ({
        id: sluggify(section.menuTitle!),
        text: section.menuTitle!,
      })) || [];

  if (!success || !sections) {
    return (
      <div className="container mx-auto px-md py-lg">
        <p className="text-destructive">{error || "Failed to load sections"}</p>
      </div>
    );
  }

  if (sections.length === 0) {
    return (
      <div className="container mx-auto px-md py-lg">
        <p className="text-muted-foreground">No sections available yet.</p>
      </div>
    );
  }

  return (
    <>
      <Hero salonSlug={salonSlug} />

      <StickyMenuBar menuItems={menuItems} />

      <div className="w-full">
        {sections.map((section, index) => (
          <div
            key={section.id}
            id={sluggify(section.menuTitle || `section-${index + 1}`)}
          >
            <SectionRenderer section={section} order={index} />
          </div>
        ))}
      </div>
    </>
  );
}
