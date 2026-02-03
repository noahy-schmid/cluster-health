"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/menu-items";

interface MenuListProps {
  onItemClick?: () => void;
}

export function MenuList({ onItemClick }: MenuListProps) {
  const pathname = usePathname();

  return (
    <nav className="flex-1 overflow-y-auto py-lg">
      <ul className="space-y-sm">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <li key={item.href} className="px-md">
              <Link
                href={item.href}
                onClick={onItemClick}
                className={`
                  flex items-center gap-md px-md py-sm rounded-md
                  text-sm font-medium transition-fast
                  ${
                    isActive
                      ? "bg-bg-1 text-fg-strong"
                      : "text-fg-muted hover:bg-bg-2 hover:text-fg-strong"
                  }
                `}
              >
                <Icon className="w-icon-md h-icon-md" />
                <span>{item.label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
