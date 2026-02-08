interface ColorPreviewProps {
  backgroundColor: string;
  foregroundColor: string;
  accentColor: string;
  derivedColors: {
    bgCard: string;
    bgCardHover: string;
    fgMuted: string;
    fgStrong: string;
    accentText: string;
    isDarkMode: boolean;
  };
}

export default function ColorPreview({
  backgroundColor,
  foregroundColor,
  accentColor,
  derivedColors,
}: ColorPreviewProps) {
  return (
    <div className="pt-lg border-t border-border">
      <div className="flex items-center justify-between mb-md">
        <h3 className="text-base font-normal text-fg-strong">Vorschau</h3>
        <span
          className={`px-md py-sm text-sm font-focus rounded-full ${
            derivedColors.isDarkMode
              ? "bg-primary-500 text-fg-inv"
              : "bg-bg-2 text-fg-normal"
          }`}
        >
          {derivedColors.isDarkMode ? "Dunkel" : "Hell"}
        </span>
      </div>
      <div
        className="rounded-lg overflow-hidden border border-border"
        style={{ backgroundColor }}
      >
        {/* Navigation bar */}
        <div
          className="px-lg py-md flex items-center justify-between"
          style={{ backgroundColor: derivedColors.bgCardHover }}
        >
          <span
            className="font-brand text-lg"
            style={{ color: derivedColors.fgStrong }}
          >
            Salon Name
          </span>
          <div className="flex gap-md">
            <button
              className="px-md py-sm rounded"
              style={{
                color: derivedColors.fgStrong,
              }}
            >
              Home
            </button>
            <button
              className="px-md py-sm rounded"
              style={{
                color: derivedColors.fgMuted,
              }}
            >
              Dienstleistungen
            </button>
            <button
              className="px-md py-sm rounded"
              style={{
                backgroundColor: accentColor,
                color: derivedColors.accentText,
              }}
            >
              Termin buchen
            </button>
          </div>
        </div>

        {/* Main content area */}
        <div className="p-lg">
          <h4
            className="text-2xl font-brand mb-md"
            style={{ color: derivedColors.fgStrong }}
          >
            Beispiel-Überschrift
          </h4>
          <p className="mb-md" style={{ color: foregroundColor }}>
            Dies ist ein Beispieltext, um zu zeigen, wie Ihre Farben
            zusammenwirken. Der Text sollte gut lesbar sein und einen guten
            Kontrast zum Hintergrund bieten.
          </p>
          <p className="text-sm mb-lg" style={{ color: derivedColors.fgMuted }}>
            Dies ist ein sekundärer Text in einer helleren Farbe für weniger
            wichtige Informationen.
          </p>

          {/* Card */}
          <div
            className="rounded-lg p-lg"
            style={{ backgroundColor: derivedColors.bgCard }}
          >
            <h5
              className="text-lg font-medium mb-sm"
              style={{ color: derivedColors.fgStrong }}
            >
              Informationskarte
            </h5>
            <p className="text-sm mb-md" style={{ color: foregroundColor }}>
              Dies ist eine Karte, die auf dem Hintergrund liegt. Sie hat eine
              leicht andere Farbe für visuelle Hierarchie.
            </p>
            <button
              className="px-lg py-sm rounded-md font-medium"
              style={{
                backgroundColor: accentColor,
                color: derivedColors.accentText,
              }}
            >
              Call to Action
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
