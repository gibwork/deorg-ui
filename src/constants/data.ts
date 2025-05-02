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
} from "lucide-react";

export const gibworkLogoImgUrl = "https://media.gib.work/work-logo.png";
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
    label: "Proposals",
    icon: FileText,
    value: "proposals",
    href: (orgId: string) => `/organizations/${orgId}/proposals`,
  },
  {
    label: "Projects",
    icon: FolderKanban,
    value: "projects",
    href: (orgId: string) => `/organizations/${orgId}/projects`,
  },
  {
    label: "Tasks",
    icon: ListChecks,
    value: "tasks",
    href: (orgId: string) => `/organizations/${orgId}/tasks`,
  },
  {
    label: "Members",
    icon: Users,
    value: "members",
    href: (orgId: string) => `/organizations/${orgId}/members`,
  },
  {
    label: "Activity",
    icon: Clock,
    value: "activity",
    href: (orgId: string) => `/organizations/${orgId}/activity`,
  },
  {
    label: "Transactions",
    icon: DollarSign,
    value: "transactions",
    href: (orgId: string) => `/organizations/${orgId}/transactions`,
  },
  {
    label: "Settings",
    icon: Settings,
    value: "settings",
    href: (orgId: string) => `/organizations/${orgId}/settings`,
  },
];

export enum TaskType {
  General = "GENERAL",
  Github = "GITHUB",
}

export const availableTags = [
  "Misc",
  "Governance",
  "Exchanges",
  "Decentralized Finance (DeFi)",
  "Frontend Technologies",
  "Solana Development",
  "UI/UX",
  "Software Development",
];

export const tasksCategories = [
  "Misc",
  "Feedback",
  "Social Media",
  "Programming",
  "Writing",
];
export const openSourceTags = [
  "Other",
  "Python",
  "JavaScript",
  "Java",
  "C++",
  "C#",
  "Ruby",
  "PHP",
  "Swift",
  "TypeScript",
  "Go",
  "Kotlin",
  "Rust",
  "HTML",
  "CSS",
  "React",
  "Angular",
  "Vue.js",
  "Django",
  "Flask",
  "Spring Boot",
  "Text",
];

export const previousPaidWorkTransactions = [
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/77497858?v=4",
    displayName: "@crypt0miester",
    paymentAmount: "7,000.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/32637757?v=4",
    displayName: "@sunguru98",
    paymentAmount: "1,051.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/15316761?v=4",
    displayName: "@Redfox",
    paymentAmount: "526.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/144289373?v=4",
    displayName: "@ritrafa",
    paymentAmount: "301.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },

  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/100378695?v=4",
    displayName: "@joeymeere",
    paymentAmount: "300.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/18724586?v=4",
    displayName: "@Igoones",
    paymentAmount: "176.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/95687419?v=4",
    displayName: "@shubhiscoding",
    paymentAmount: "101.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg:
      "https://pbs.twimg.com/profile_images/1742907058091884544/9e2It_B7_400x400.jpg",
    displayName: "@NiKHiLkr23",
    paymentAmount: "101.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/120790871?v=4",
    displayName: "@Shiva953",
    paymentAmount: "51.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/76485932?v=4",
    displayName: "@simplysabir",
    paymentAmount: "51.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/158581073?v=4",
    displayName: "@Rosegakono",
    paymentAmount: "45.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/12031208?v=4",
    displayName: "@GabrielePicco",
    paymentAmount: "33.33",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/65243529?v=4",
    displayName: "@dwrx",
    paymentAmount: "5.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/10921578?v=4",
    displayName: "@deanmlittle",
    paymentAmount: "1.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/36491?v=4",
    displayName: "@beeman",
    paymentAmount: "1.20",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/125566964?v=4",
    displayName: "@LEO",
    paymentAmount: "1.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
  {
    workTitle: "contributed to oss",
    profileImg: "https://avatars.githubusercontent.com/u/110206718?v=4",
    displayName: "@beliven",
    paymentAmount: "1.00",
    tokenImgUrl:
      "https://s2.coinmarketcap.com/static/img/coins/128x128/3408.png",
  },
];

export const gibworkTotalVolume = "$38189.21";

export const CreatedWorkStatus = [
  {
    value: "in progress",
    label: "In Progress",
    icon: CircleIcon,
  },
  {
    value: "complete",
    label: "Complete",
    icon: CircleIcon,
  },
  {
    value: "refunded",
    label: "Refunded",
    icon: CircleIcon,
  },
  {
    value: "creating",
    label: "Creating",
    icon: CircleIcon,
  },
  {
    value: "awaiting deposit",
    label: "Awaiting Deposit",
    icon: CircleIcon,
  },
];

export const SubmittedWorkStatus = [
  {
    value: "OPEN",
    label: "In Review",
    icon: CircleIcon,
  },
  {
    value: "WAITING_CLAIM",
    label: "Approved",
    icon: CircleIcon,
  },
  {
    value: "CLAIMED",
    label: "Claimed",
    icon: CircleIcon,
  },
  {
    value: "CLOSED",
    label: "Closed",
    icon: CircleIcon,
  },
];

export const WorkTypesFilter = [
  {
    value: "bounties",
    label: "Bounty",
    icon: Icons.bounty,
  },
  {
    value: "tasks",
    label: "Task",
    icon: Icons.task,
  },
];

interface WorkType {
  value: string;
  label: string;
  icon: keyof typeof Icons;
}
export const WorkTypes: WorkType[] = [
  {
    value: "bounties",
    label: "Bounty",
    icon: "bounty",
  },
  {
    value: "tasks",
    label: "Task",
    icon: "task",
  },
];

export type DataTableConfig = typeof dataTableConfig;

export const dataTableConfig = {
  comparisonOperators: [
    { label: "Contains", value: "ilike" as const },
    { label: "Does not contain", value: "notIlike" as const },
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "notEq" as const },
    { label: "Starts with", value: "startsWith" as const },
    { label: "Ends with", value: "endsWith" as const },
    { label: "Is empty", value: "isNull" as const },
    { label: "Is not empty", value: "isNotNull" as const },
  ],
  selectableOperators: [
    { label: "Is", value: "eq" as const },
    { label: "Is not", value: "notEq" as const },
    { label: "Is empty", value: "isNull" as const },
    { label: "Is not empty", value: "isNotNull" as const },
  ],
  logicalOperators: [
    {
      label: "And",
      value: "and" as const,
      description: "All conditions must be met",
    },
    {
      label: "Or",
      value: "or" as const,
      description: "At least one condition must be met",
    },
  ],
  featureFlags: [
    {
      label: "Advanced filter",
      value: "advancedFilter" as const,
      icon: SlidersHorizontalIcon,
      tooltipTitle: "Toggle advanced filter",
      tooltipDescription: "A notion like query builder to filter rows.",
    },
    {
      label: "Floating bar",
      value: "floatingBar" as const,
      icon: PencilRulerIcon,
      tooltipTitle: "Toggle floating bar",
      tooltipDescription: "A floating bar that sticks to the top of the table.",
    },
  ],
};
