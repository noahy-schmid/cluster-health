import { WebsiteRouteContextProvider } from "@/components/WebsiteRouteContext";

export default async function SectionLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ salonId: string; websiteId: string; sectionId: string }>;
}) {
  const { salonId, websiteId, sectionId } = await params;
  return (
    <WebsiteRouteContextProvider
      value={{
        salonId,
        websiteId,
        sectionId,
      }}
    >
      {children}
    </WebsiteRouteContextProvider>
  );
}
