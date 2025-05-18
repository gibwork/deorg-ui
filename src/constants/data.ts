import { Icons } from "@/components/icons";
import { NavItem } from "@/types/types.sidebar";
import {
  CircleCheckBigIcon,
  CircleCheckIcon,
  CircleIcon,
  CircleXIcon,
  HourglassIcon,
  PencilRulerIcon,
  SlidersHorizontalIcon,
  TicketXIcon,
  MessageSquare,
  BarChart2,
  FileText,
  FolderKanban,
  Users,
  DollarSign,
  Clock,
  Settings,
  Home,
  ListChecks,
  Wallet,
} from "lucide-react";

export const workLogoImgUrl = "https://media.gib.work/work-logo.png";
export const checkImgUrl = "https://cdn.gib.work/images/check-image.png";

export const navItems: NavItem[] = [
  {
    title: "Explore",
    href: "/",
    icon: "explore",
    label: "explore",
  },
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: "dashboard",
    label: "Dashboard",
  },
  {
    title: "Organizations",
    href: "/organizations",
    icon: "organization",
    label: "Organizations",
  },
  {
    title: "Messages",
    href: "/messages",
    icon: "messageSquare",
    label: "Messages",

    new: true,
  },
];

export const OrganizationNavbarItems = [
  {
    label: "Home",
    icon: Home,
    value: "home",
    href: (orgId: string) => `/organizations/${orgId}`,
  },
  {
    label: "Assets",
    icon: Wallet,
    value: "assets",
    href: (orgId: string) => `/organizations/${orgId}/assets`,
  },
  // {
  //   label: "Proposals",
  //   icon: FileText,
  //   value: "proposals",
  //   href: (orgId: string) => `/organizations/${orgId}/proposals`,
  // },
  {
    label: "Projects",
    icon: FolderKanban,
    value: "projects",
    href: (orgId: string) => `/organizations/${orgId}/projects`,
  },
  // {
  //   label: "Tasks",
  //   icon: ListChecks,
  //   value: "tasks",
  //   href: (orgId: string) => `/organizations/${orgId}/tasks`,
  // },
  {
    label: "Members",
    icon: Users,
    value: "members",
    href: (orgId: string) => `/organizations/${orgId}/members`,
  },
  // {
  //   label: "Activity",
  //   icon: Clock,
  //   value: "activity",
  //   href: (orgId: string) => `/organizations/${orgId}/activity`,
  // },
  // {
  //   label: "Transactions",
  //   icon: DollarSign,
  //   value: "transactions",
  //   href: (orgId: string) => `/organizations/${orgId}/transactions`,
  // },
  {
    label: "Settings",
    icon: Settings,
    value: "settings",
    href: (orgId: string) => `/organizations/${orgId}/settings`,
  },
];
