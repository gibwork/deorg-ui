"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import {
  BarChart2,
  Users,
  FolderKanban,
  DollarSign,
  Clock,
  Settings,
  FileText,
} from "lucide-react";

const navItems = [
  {
    name: "Overview",
    href: (orgId: string) => `/organizations/${orgId}`,
    icon: BarChart2,
  },
  {
    name: "Projects",
    href: (orgId: string) => `/organizations/${orgId}/projects`,
    icon: FolderKanban,
  },
  {
    name: "Proposals",
    href: (orgId: string) => `/organizations/${orgId}/proposals`,
    icon: FileText,
  },
  {
    name: "Tasks",
    href: (orgId: string) => `/organizations/${orgId}/tasks`,
    icon: FileText,
  },
  {
    name: "Members",
    href: (orgId: string) => `/organizations/${orgId}/members`,
    icon: Users,
  },
  //   {
  //     name: "Payroll",
  //     href: (orgId: string) => `/organizations/${orgId}/payroll`,
  //     icon: DollarSign,
  //   },
  {
    name: "Transactions",
    href: (orgId: string) => `/organizations/${orgId}/transactions`,
    icon: DollarSign,
  },
  {
    name: "Activity",
    href: (orgId: string) => `/organizations/${orgId}/activity`,
    icon: Clock,
  },

  {
    name: "Settings",
    href: (orgId: string) => `/organizations/${orgId}/settings`,
    icon: Settings,
  },
];

export function OrganizationNav({ orgId }: { orgId: string }) {
  const pathname = usePathname();

  return (
    <nav className="flex flex-col overflow-x-auto my-6">
      <div
        className={cn(
          "inline-flex h-9 items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground",
          "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 w-full"
        )}
      >
        {navItems.map((item) => {
          const href = item.href(orgId);
          const isActive = pathname === href;

          return (
            <Link
              key={item.name}
              href={href}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
                isActive ? "bg-background text-foreground shadow-sm" : ""
              )}
            >
              <item.icon className="h-4 w-4 mr-2" />
              {item.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
