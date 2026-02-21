import { fetchColorsBySalonSlug } from "@/api/sections-actions";
import { fetchWebsiteMetadataSettingsBySalonSlug } from "@/api/website-settings-actions";
import type { Metadata } from "next";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ salonSlug: string }>;
}): Promise<Metadata> {
  const { salonSlug } = await params;

  const metadataResult =
    await fetchWebsiteMetadataSettingsBySalonSlug(salonSlug);

  if (metadataResult.success && metadataResult.settings) {
    const { title, favicon } = metadataResult.settings;

    return {
      title,
      ...(favicon && {
        icons: {
          icon: favicon,
        },
      }),
    };
  }

  // Fallback metadata
  return {
    title: "Salon",
  };
}

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
        <div className="bg-salon-bg-base text-salon-fg-base">{children}</div>
      </>
    );
  }

  // If no colors available, just render children without custom colors
  return <div>{children}</div>;
}
