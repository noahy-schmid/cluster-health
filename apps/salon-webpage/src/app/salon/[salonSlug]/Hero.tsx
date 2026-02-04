/* eslint-disable @next/next/no-img-element */
import { fetchHeroSettingsBySalonSlug } from "@/api/hero-actions";
import { CircleChevronDown } from "lucide-react";
import Image from "next/image";

interface HeroProps {
  salonSlug: string;
}

export default async function Hero({ salonSlug }: HeroProps) {
  const { settings } = await fetchHeroSettingsBySalonSlug(salonSlug);

  // Fallback to default images if settings not found
  const backgroundImage = settings?.backgroundImageUrl || "/images/hair.png";
  const logo = settings?.logoImageUrl || "/images/logo.png";
  const title = settings?.title || "Wir lieben Haare";
  const subtitle = settings?.subtitle || "Herzlich Willkommen in unserem Salon";

  return (
    <section className="relative">
      <img
        className="w-full object-cover lg:h-[100dvh]"
        src={backgroundImage}
        alt="Hero background"
        width={2000}
        height={2000}
      />
      <div className="absolute w-full h-full top-0 z-1 bg-gradient-to-b from-80% from-transparent to-bg-dark"></div>
      <img
        src={logo}
        alt="Salon logo"
        width={100}
        height={100}
        className="absolute bottom-4 left-4 w-[150px] z-2"
      />

      {/* Hero slogan - only visible on tablet/desktop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-4 hidden md:block">
        <h1 className="text-5xl font-bold text-shadow-2xl mb-4">{title}</h1>
        <p className="text-lg opacity-90 text-shadow-xl font-light">
          {subtitle}
        </p>
      </div>

      {/* Animated arrow - only visible on tablet/desktop */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-fg z-3 hidden animate-bounce md:block">
        <CircleChevronDown size={32} />
      </div>
    </section>
  );
}
