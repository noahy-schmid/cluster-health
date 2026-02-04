import { HeroSettings } from "@/lib/types/section-types";
import { ImageIcon } from "lucide-react";
import SectionHeader from "./SectionHeader";

interface HeroCardProps {
  settings: HeroSettings;
}

export default function HeroCard({ settings }: HeroCardProps) {
  const hasBackground =
    settings.backgroundImageUrl && settings.backgroundImageUrl.trim() !== "";
  const hasLogo = settings.logoImageUrl && settings.logoImageUrl.trim() !== "";

  return (
    <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg hover:shadow-md transition-shadow">
      <SectionHeader title="Startseite" />

      {/* Hero Preview - mimics the actual website design */}
      <div className="relative aspect-video bg-bg-0 rounded-md overflow-hidden md:mx-2xl">
        {/* Background Image */}
        {hasBackground ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={settings.backgroundImageUrl}
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <div className="flex flex-col items-center gap-sm text-fg-muted">
              <ImageIcon className="w-lg h-lg" />
              <span className="text-sm">Kein Hintergrundbild</span>
            </div>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent from-80% to-black/80" />

        {/* Logo - Bottom Left */}
        {hasLogo ? (
          <div className="absolute bottom-4 left-4 z-10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={settings.logoImageUrl}
              alt="Logo"
              className="w-20 h-20 object-contain"
            />
          </div>
        ) : (
          <div className="absolute bottom-4 left-4 z-10 w-20 h-20 bg-white/10 rounded flex items-center justify-center">
            <ImageIcon className="w-8 h-8 text-white/50" />
          </div>
        )}

        {/* Title and Subtitle - Centered */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-white z-10 w-full px-4">
          <h4 className="text-lg md:text-2xl font-bold mb-2 drop-shadow-lg">
            {settings.title || "Kein Titel"}
          </h4>
          <p className="text-sm md:text-base opacity-90 drop-shadow-md font-light">
            {settings.subtitle || "Kein Untertitel"}
          </p>
        </div>
      </div>
    </div>
  );
}
