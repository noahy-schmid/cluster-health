import {
  LayoutDashboard,
  Settings,
  type LucideIcon,
  Earth,
  Users,
} from "lucide-react";

export interface MenuItem {
  icon: LucideIcon;
  label: string;
  href: string;
}

export const menuItems: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: "Dein Salon",
    href: "/salon/:salonId",
  },
  {
    icon: Earth,
    label: "Webseite",
    href: "/salon/:salonId/website",
  },
  {
    icon: Users,
    label: "Stylisten",
    href: "/salon/:salonId/stylists",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/salon/:salonId/settings",
  },
];
