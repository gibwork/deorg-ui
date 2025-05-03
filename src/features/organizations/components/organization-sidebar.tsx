"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import {
  BarChart3,
  Calendar,
  FileText,
  Home,
  ListChecks,
  Settings,
  Users,
  Activity,
  ArrowLeftToLine,
  ArrowLeft,
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarFooter,
} from "@/components/ui/sidebar";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { OrganizationNavbarItems } from "@/constants/data";
import { useOrganization } from "../hooks/use-organization";
import { OrgsSwitcher } from "./orgs-switcher";
import { Icons } from "@/components/icons";
import { useMemo } from "react";
export function OrganizationSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();
  const { data: organization } = useOrganization(orgId);

  const mockOrgs = useMemo(() => {
    return [
      {
        name: organization?.name,
        logoUrl: organization?.logoUrl,
        id: organization?.id,
      },
      {
        name: "Organization",
        logoUrl: organization?.logoUrl,
        id: "123",
      },
    ];
  }, [organization]);
  return (
    <>
      {!isMobile && (
        <div className="fixed top-4 left-4 z-40 md:hidden">
          <SidebarTrigger />
        </div>
      )}

      <Sidebar className="relative max-h-full ">
        <Link href="/" className=" flex items-center justify-center px-3 py-2">
          <Icons.workLogo
            width={32}
            height={32}
            className="rounded-md me-2 mt-1 "
          />
          <h2 className="text-3xl  font-bold tracking-tight ">DeOrg</h2>
        </Link>
        <SidebarHeader className="flex items-center px-3 justify-between  ">
          <OrgsSwitcher orgs={mockOrgs} />
          {isMobile && <SidebarTrigger />}
        </SidebarHeader>

        <SidebarContent className="px-3">
          <SidebarMenu>
            {OrganizationNavbarItems.map((item) => {
              const isActive = pathname === item.href(orgId);

              return (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className="h-10"
                  >
                    <Link href={item.href(orgId)}>
                      <item.icon className="h-5 w-5" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              );
            })}
          </SidebarMenu>
        </SidebarContent>

        <SidebarFooter className="p-4 ">
          <Link
            href="/organizations"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "w-full flex items-center justify-between"
            )}
          >
            <div className="flex items-center">
              <ArrowLeft className="h-4 w-4 mr-2" />
              <span className="text-sm">Organizations</span>
            </div>
          </Link>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
