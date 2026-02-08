import { WebsiteRouteContextProvider } from "@/components/WebsiteRouteContext";

export default async function WebsiteLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ salonId: string; websiteId: string }>;
}) {
  const { salonId, websiteId } = await params;
  return (
    <WebsiteRouteContextProvider value={{ salonId, websiteId }}>
      {children}
    </WebsiteRouteContextProvider>
  );
}
