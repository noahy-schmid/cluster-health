import {
  LayoutDashboard,
  Calendar,
  Users,
  Scissors,
  Settings,
  BarChart3,
  Clock,
  type LucideIcon,
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
    icon: Calendar,
    label: "Appointments",
    href: "/appointments",
  },
  {
    icon: Users,
    label: "Clients",
    href: "/clients",
  },
  {
    icon: Scissors,
    label: "Services",
    href: "/services",
  },
  {
    icon: Clock,
    label: "Schedule",
    href: "/schedule",
  },
  {
    icon: BarChart3,
    label: "Analytics",
    href: "/analytics",
  },
  {
    icon: Settings,
    label: "Settings",
    href: "/settings",
  },
];
