import { AuthGuard } from "@/api/guards/auth.guard";
import { HeroSection } from "@/components/HeroSection";
import { LandingNav } from "@/components/LandingNav";

export default async function Home() {
  const authToken = await AuthGuard.getAuthToken();
  const isLoggedIn = !!authToken;
  const salonId = authToken?.salonId;

  return (
    <div className="h-dvh bg-bg-0 flex flex-col relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute -top-24 -left-20 h-72 w-72 rounded-full bg-primary-100 opacity-50 blur-3xl pointer-events-none" />
      <div className="absolute top-40 right-0 h-64 w-64 rounded-full bg-bg-2 opacity-80 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/3 h-64 w-64 rounded-full bg-primary-200 opacity-40 blur-3xl pointer-events-none" />

      {/* Top navigation */}
      <LandingNav isLoggedIn={isLoggedIn} salonId={salonId} />

      {/* Hero section */}
      <HeroSection isLoggedIn={isLoggedIn} salonId={salonId} />
    </div>
  );
}
