import { MainLayout } from "@/components/MainLayout";
import { WebsiteRouteContextProvider } from "@/components/WebsiteRouteContext";

export const dynamic = "force-dynamic";

export default async function SalonIdLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ salonId: string }>;
}) {
  const { salonId } = await params;
  return (
    <WebsiteRouteContextProvider value={{ salonId }}>
      <MainLayout>{children}</MainLayout>
    </WebsiteRouteContextProvider>
  );
}
