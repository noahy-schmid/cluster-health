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
    href: "/salon",
  },
  {
    icon: Earth,
    label: "Webseite",
    href: "/salon/website",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/salon/settings",
  },
];
