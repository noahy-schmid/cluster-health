"use client";

import { MenuList } from "./MenuList";
import { UserProfile } from "./UserProfile";

export function Sidebar() {
  return (
    <aside className="flex flex-col h-screen sticky top-0 bg-bg-2">
      {/* Logo/Brand */}
      <div className="p-lg text-center">
        <h1 className="font-brand font-bold text-xl text-brand-text">
          dein<span className="text-primary-600 text-4xl">.</span>salon
        </h1>
      </div>

      {/* Navigation Menu */}
      <MenuList />

      {/* Footer/User Section */}
      <UserProfile />
    </aside>
  );
}
