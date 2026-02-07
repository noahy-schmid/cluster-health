// Auth layout - bypasses MainLayout (no sidebar/menu)
export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return <>{children}</>;
}
