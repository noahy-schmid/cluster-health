"use client";

import { useState } from "react";
import { Menu, X } from "lucide-react";
import { MenuList } from "./MenuList";
import { UserProfile } from "./UserProfile";

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <header className="sticky top-0 z-40 h-header flex items-center justify-between p-md bg-bg-1 border-b border-border">
        <h1 className="font-brand font-bold text-xl text-fg-brand">
          dein<span className="text-primary-600 text-4xl">.</span>salon
        </h1>
        <button
          onClick={toggleMenu}
          className="p-sm rounded-md hover:bg-sidebar-hover transition-fast"
          aria-label={isOpen ? "Close menu" : "Open menu"}
          aria-expanded={isOpen}
        >
          <Menu className="w-icon-lg h-icon-lg" />
        </button>
      </header>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50"
          onClick={closeMenu}
          aria-hidden="true"
        />
      )}

      {/* Mobile Menu Drawer */}
      <aside
        className={`
          fixed top-0 right-0 z-50 h-full w-sidebar bg-bg-1
          shadow-lg transform transition-transform duration-normal
          ${isOpen ? "translate-x-0" : "translate-x-full"}
        `}
      >
        {/* Menu Header */}
        <div className="h-header flex items-center justify-between p-md border-b border-border">
          <h2 className="text-lg font-bold text-text-primary">Menu</h2>
          <button
            onClick={closeMenu}
            className="p-sm rounded-md hover:bg-sidebar-hover transition-fast"
            aria-label="Close menu"
          >
            <X className="w-icon-md h-icon-md" />
          </button>
        </div>

        {/* Navigation Menu */}
        <MenuList onItemClick={closeMenu} />

        {/* User Section */}
        <UserProfile />
      </aside>
    </>
  );
}
