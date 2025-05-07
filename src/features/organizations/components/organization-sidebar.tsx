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
import { SlimOrgSidebar } from "./slim-org-sidebar";
import { SideBarLoading } from "@/components/layout/sidebar";
import Image from "next/image";
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

  if (!organization) {
    return <SideBarLoading />;
  }

  return (
    <>
      {!isMobile && (
        <div className="fixed top-4 left-4 z-40 md:hidden">
          <SidebarTrigger />
        </div>
      )}

      <SlimOrgSidebar orgId={organization!.accountAddress!} className="shadow-md" />
      <Sidebar className="fixed top-0 left-16 max-h-full bg-white" style={{ height: "100vh" }}>
        <SidebarHeader className="pb-0">
          <div className="flex flex-row border-b border-stone-200 h-[50px]">
            <div className="h-[42px] w-[42px]">
              <Image src={organization?.logoUrl ?? ""} alt={organization.name} width={42} height={42} className="rounded-lg p-1" />
            </div>
            <h1 className="text-lg font-bold pt-2">{organization.name}</h1>
          </div>
          <div className="flex flex-col items-center justify-center py-2 border-b">
            <div className="flex flex-row items-center gap-2">
              <Icons.usdc className="h-8 w-8" />
              <span className="text-3xl font-bold text-black">$100.17</span>
            </div>
            <span className="text-sm text-stone-500">Total Earned</span>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {OrganizationNavbarItems.map((item) => {
              const isActive = pathname === item.href(orgId);

              return (
                <SidebarMenuItem key={item.value} className="border-b border-stone-200">
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
                    className="h-10"
                  >
                    <Link href={item.href(orgId)} className={cn(isActive && " !text-black", "rounded-none")}>
                      <item.icon className={cn("h-8 w-8", isActive && "stroke-black")} />
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
