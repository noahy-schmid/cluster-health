"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { menuItems } from "@/lib/menu-items";
import { useWebsiteRouteContext } from "@/components/WebsiteRouteContext";

interface MenuListProps {
  onItemClick?: () => void;
}

export function MenuList({ onItemClick }: MenuListProps) {
  const pathname = usePathname();
  const { salonId } = useWebsiteRouteContext();

  const resolvedItems = menuItems.map((item) => {
    const withSalon = item.href.replace(":salonId", salonId);
    return {
      ...item,
      href: withSalon,
    };
  });

  const matchedItems = resolvedItems.map((item) => {
    const isMatch =
      pathname === item.href || pathname.startsWith(`${item.href}/`);
    return {
      ...item,
      isMatch,
      matchLength: isMatch ? item.href.length : -1,
    };
  });

  const maxMatchLength = matchedItems.reduce(
    (max, item) => Math.max(max, item.matchLength),
    -1,
  );

  return (
    <nav className="flex-1 overflow-y-auto py-lg">
      <ul className="space-y-sm">
        {matchedItems.map((item) => {
          const isActive = item.isMatch && item.matchLength === maxMatchLength;
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
