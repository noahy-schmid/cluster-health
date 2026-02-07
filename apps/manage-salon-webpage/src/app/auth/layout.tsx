import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Authentifizierung - dein.salon",
  description: "Anmelden oder registrieren Sie sich bei dein.salon",
};

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Auth pages should not have the sidebar/main layout
  // Just return children directly, the parent layout handles html/body
  return <>{children}</>;
}
