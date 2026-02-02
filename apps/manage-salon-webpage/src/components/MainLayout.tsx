"use client";

import { Sidebar } from "./Sidebar";
import { MobileMenu } from "./MobileMenu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-[var(--color-content-bg)]">
      {/* Desktop Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu */}
        <MobileMenu />

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto">
          <div className="p-[var(--spacing-lg)] lg:p-[var(--spacing-2xl)]">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
