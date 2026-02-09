"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import PageHeader from "@/components/PageHeader";
import ColorPicker from "@/components/ColorPicker";
import FormActions from "@/components/website/forms/FormActions";
import ColorPreview from "@/app/salon/[salonId]/website/[websiteId]/colors/ColorPreview";
import { formatHex, oklch } from "culori";
import { ColorSettings, updateColorSettings } from "@/api/website-actions";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";

interface ColorsEditorClientProps {
  initialColors: ColorSettings;
}

export default function ColorsEditorClient({
  initialColors,
}: ColorsEditorClientProps) {
  const router = useRouter();
  const { salonId, websiteId } = useWebsiteRouteContext();

  const [backgroundColor, setBackgroundColor] = useState(
    initialColors.backgroundBase,
  );
  const [foregroundColor, setForegroundColor] = useState(
    initialColors.foregroundBase,
  );
  const [accentColor, setAccentColor] = useState(initialColors.accent);

  const derivedColors = useMemo(() => {
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

    const isDarkMode = bgOklch.l < 0.5;

    const bgCard = formatHex(
      oklch({
        ...bgOklch,
        l: Math.min(1, bgOklch.l + 0.02),
      }),
    );

    const bgCardHover = formatHex(
      oklch({
        ...bgOklch,
        l: Math.min(1, bgOklch.l + 0.04),
      }),
    );

    const fgMuted = formatHex(
      oklch({
        ...fgOklch,
        l: isDarkMode
          ? Math.max(0, fgOklch.l - 0.15)
          : Math.min(1, fgOklch.l + 0.15),
      }),
    );

    const fgStrong = formatHex(
      oklch({
        ...fgOklch,
        l: isDarkMode
          ? Math.min(1, fgOklch.l + 0.1)
          : Math.max(0, fgOklch.l - 0.1),
      }),
    );

    const bgAccentContrast = Math.abs(bgOklch.l - accentOklch.l);
    const fgAccentContrast = Math.abs(fgOklch.l - accentOklch.l);

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
  }, [backgroundColor, foregroundColor, accentColor]);

  const handleSave = async () => {
    await updateColorSettings(websiteId ?? "", {
      backgroundBase: backgroundColor,
      backgroundElevation1: derivedColors.bgCard,
      backgroundElevation2: derivedColors.bgCardHover,
      foregroundBase: foregroundColor,
      foregroundMuted: derivedColors.fgMuted,
      foregroundStrong: derivedColors.fgStrong,
      accent: accentColor,
      onAccent: derivedColors.accentText,
    });
    router.replace(`/salon/${salonId}/website/${websiteId}`);
  };

  const handleCancel = () => {
    router.replace(`/salon/${salonId}/website/${websiteId}`);
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
