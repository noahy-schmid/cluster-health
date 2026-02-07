"use client";

import { usePathname } from "next/navigation";
import { MainLayout } from "./MainLayout";

interface ConditionalLayoutProps {
  children: React.ReactNode;
}

export function ConditionalLayout({ children }: ConditionalLayoutProps) {
  const pathname = usePathname();
  
  // Don't show MainLayout on auth pages
  const isAuthPage = pathname?.startsWith("/auth");
  
  if (isAuthPage) {
    return <>{children}</>;
  }
  
  return <MainLayout>{children}</MainLayout>;
}
