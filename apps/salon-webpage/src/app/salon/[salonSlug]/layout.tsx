import { fetchColorsBySalonSlug } from "@/api/sections-actions";

export default async function SalonLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ salonSlug: string }>;
}) {
  const { salonSlug } = await params;

  // Fetch colors for this salon
  const colorsResult = await fetchColorsBySalonSlug(salonSlug);

  // If colors are available, inject them as CSS variables via style tag
  if (colorsResult.success && colorsResult.colors) {
    const { colors } = colorsResult;

    return (
      <>
        <style
          dangerouslySetInnerHTML={{
            __html: `
              :root {
                --color-bg-base: ${colors.backgroundBase};
                --color-bg-elevation-1: ${colors.backgroundElevation1};
                --color-bg-elevation-2: ${colors.backgroundElevation2};
                --color-fg-base: ${colors.foregroundBase};
                --color-fg-muted: ${colors.foregroundMuted};
                --color-fg-strong: ${colors.foregroundStrong};
                --color-accent: ${colors.accent};
                --color-on-accent: ${colors.onAccent};
              }
            `,
          }}
        />
        {children}
      </>
    );
  }

  // If no colors available, just render children without custom colors
  return <>{children}</>;
}
