// Onboarding layout - bypasses MainLayout (no sidebar/menu)
export default function OnboardingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
