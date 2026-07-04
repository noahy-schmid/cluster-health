import {
  LayoutDashboard,
  Settings,
  type LucideIcon,
  Earth,
  Users,
  Scissors,
  Clock,
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
    icon: Scissors,
    label: "Dienstleistungen",
    href: "/salon/:salonId/services",
  },
  {
    icon: Clock,
    label: "Öffnungszeiten",
    href: "/salon/:salonId/opening-hours",
  },
  {
    icon: Settings,
    label: "Einstellungen",
    href: "/salon/:salonId/settings",
  },
];
