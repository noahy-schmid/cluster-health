import {
  LayoutDashboard,
  Settings,
  type LucideIcon,
  Earth,
} from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dashboard",
    href: "/",
  },
  {
    icon: Earth,
    label: "Webseite",
    href: "/website",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];
