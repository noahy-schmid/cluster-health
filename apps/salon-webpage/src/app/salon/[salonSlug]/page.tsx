import { fetchSectionsBySalonSlug } from "@/api/sections-actions";
import SectionRenderer from "@/components/sections/SectionRenderer";
import StickyMenuBar, { MenuItem } from "@/components/sticky-menu-bar";
import { div } from "framer-motion/client";
import { CircleChevronDown } from "lucide-react";
import Image from "next/image";

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
      <menu className="relative">
        <Image
          className="w-full object-cover lg:h-[100dvh]"
          src={"/images/hair.png"}
          alt="hair"
          width={2000}
          height={2000}
        ></Image>
        <div className="absolute w-full h-full top-0 z-1 bg-gradient-to-b from-80% from-transparent to-bg-dark"></div>
        <Image
          src={"/images/logo.png"}
          alt="logo"
          width={100}
          height={100}
          className="absolute bottom-4 left-4 w-[150px] z-2"
        ></Image>

        {/* Hero slogan - only visible on tablet/desktop */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-4 hidden md:block">
          <h1 className="text-5xl font-bold text-shadow-2xl mb-4">
            Wir lieben Haare
          </h1>
          <p className="text-lg opacity-90 text-shadow-xl font-light">
            Herzlich Willkommen in unserem Salon
          </p>
        </div>

        {/* Animated arrow - only visible on tablet/desktop */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-fg z-3 hidden animate-bounce md:block">
          <CircleChevronDown size={32} />
        </div>
      </menu>

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
