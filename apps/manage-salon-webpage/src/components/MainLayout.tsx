"use client";

import { Sidebar } from "./menu/Sidebar";
import { MobileMenu } from "./menu/MobileMenu";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  return (
    <div className="flex h-dvh overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Mobile Menu */}
        <div className="lg:hidden">
          <MobileMenu />
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto bg-bg-0">
          <div className="p-md md:p-lg">{children}</div>
        </main>
      </div>
    </div>
  );
}
