"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useWebsiteStore } from "@/services/website-store";
import PageHeader from "@/components/PageHeader";
import ColorPicker from "@/components/ColorPicker";
import FormActions from "@/components/website/forms/FormActions";
import ColorPreview from "./ColorPreview";
import { formatHex, oklch } from "culori";

// Helper function to determine if a color is dark
function isDarkColor(color: string): boolean {
  const colorOklch = oklch(color);
  if (!colorOklch) return false;
  // If lightness is below 0.5, consider it dark
  return colorOklch.l < 0.5;
}

// Helper function to compute derived colors
function computeDerivedColors(
  backgroundColor: string,
  foregroundColor: string,
  accentColor: string,
) {
  // Convert to OKLCH
  const bgOklch = oklch(backgroundColor);
  const fgOklch = oklch(foregroundColor);
  const accentOklch = oklch(accentColor);

  if (!bgOklch || !fgOklch || !accentOklch) {
    return {
      bgCard: backgroundColor,
      bgCardHover: backgroundColor,
      fgMuted: foregroundColor,
      fgStrong: foregroundColor,
      accentText: foregroundColor,
      isDarkMode: false,
    };
  }

  const isDarkMode = isDarkColor(backgroundColor);

  // From background: create cards
  // Cards should ALWAYS be lighter than background (in both modes)
  const bgCard = formatHex(
    oklch({
      ...bgOklch,
      l: Math.min(1, bgOklch.l + 0.02), // Always lighter
    }),
  );

  const bgCardHover = formatHex(
    oklch({
      ...bgOklch,
      l: Math.min(1, bgOklch.l + 0.04), // Even more lighter
    }),
  );

  // From foreground: create muted and strong variants
  // Muted has less contrast (moves toward background)
  const fgMuted = formatHex(
    oklch({
      ...fgOklch,
      l: isDarkMode
        ? Math.max(0, fgOklch.l - 0.15) // Darker in dark mode (less bright)
        : Math.min(1, fgOklch.l + 0.15), // Lighter in light mode
    }),
  );

  // Strong foreground has MORE contrast from background
  // In dark mode: lighter (brighter) for more contrast
  // In light mode: darker for more contrast
  const fgStrong = formatHex(
    oklch({
      ...fgOklch,
      l: isDarkMode
        ? Math.min(1, fgOklch.l + 0.1) // Lighter in dark mode
        : Math.max(0, fgOklch.l - 0.1), // Darker in light mode
    }),
  );

  // Determine which color (background or foreground) has better contrast with accent
  // Calculate lightness difference (contrast)
  const bgAccentContrast = Math.abs(bgOklch.l - accentOklch.l);
  const fgAccentContrast = Math.abs(fgOklch.l - accentOklch.l);

  // Use whichever has stronger contrast
  const accentText =
    bgAccentContrast > fgAccentContrast ? backgroundColor : foregroundColor;

  return {
    bgCard,
    bgCardHover,
    fgMuted,
    fgStrong,
    accentText,
    isDarkMode,
  };
}

export default function ColorsPage() {
  const router = useRouter();
  const websiteStore = useWebsiteStore();
  const hasInitialized = useRef(false);

  const [backgroundColor, setBackgroundColor] = useState("#ffffff");
  const [foregroundColor, setForegroundColor] = useState("#000000");
  const [accentColor, setAccentColor] = useState("#d4a574");

  // Initialize website store and load colors
  useEffect(() => {
    const init = async () => {
      if (websiteStore.loading) {
        await websiteStore.initialize();
      } else if (!hasInitialized.current) {
        // Once loaded, update colors
        hasInitialized.current = true;
        setBackgroundColor(websiteStore.colorSettings.backgroundBase);
        setForegroundColor(websiteStore.colorSettings.foregroundBase);
        setAccentColor(websiteStore.colorSettings.accent);
      }
    };

    init();
  }, [websiteStore, websiteStore.loading, websiteStore.colorSettings]);

  // Show loading state while store is initializing
  if (websiteStore.loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-near-black">Loading...</p>
      </div>
    );
  }

  // Compute derived colors using OKLCH
  const derivedColors = computeDerivedColors(
    backgroundColor,
    foregroundColor,
    accentColor,
  );

  const handleSave = async () => {
    // Save all colors (base + computed) to the database
    await websiteStore.updateColorSettings({
      backgroundBase: backgroundColor,
      backgroundElevation1: derivedColors.bgCard,
      backgroundElevation2: derivedColors.bgCardHover,
      foregroundBase: foregroundColor,
      foregroundMuted: derivedColors.fgMuted,
      foregroundStrong: derivedColors.fgStrong,
      accent: accentColor,
      onAccent: derivedColors.accentText,
    });
    router.replace("/salon/website");
  };

  const handleCancel = () => {
    router.replace("/salon/website");
  };

  return (
    <div className="max-w-4xl mx-auto">
      <PageHeader
        title="Farbschema"
        subtitle="Passen Sie die Farben Ihrer Webseite an"
      />

      <div className="bg-bg-1 rounded-lg shadow-sm border border-border p-lg">
        <div className="flex flex-col gap-lg">
          <ColorPicker
            label="Hintergrundfarbe"
            helperText="Die Hauptfarbe für Hintergründe und große Flächen"
            value={backgroundColor}
            onChange={setBackgroundColor}
          />

          <ColorPicker
            label="Vordergrundfarbe"
            helperText="Die Farbe für Texte und UI-Elemente"
            value={foregroundColor}
            onChange={setForegroundColor}
          />

          <ColorPicker
            label="Akzentfarbe"
            helperText="Die Farbe für Buttons und wichtige Hervorhebungen"
            value={accentColor}
            onChange={setAccentColor}
          />

          <ColorPreview
            backgroundColor={backgroundColor}
            foregroundColor={foregroundColor}
            accentColor={accentColor}
            derivedColors={derivedColors}
          />

          <FormActions onCancel={handleCancel} onSave={handleSave} />
        </div>
      </div>
    </div>
  );
}
