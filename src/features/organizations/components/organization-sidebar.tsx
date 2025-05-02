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
export function OrganizationSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const { isMobile } = useSidebar();

  const { data: organization } = useOrganization(orgId);

  return (
    <>
      {!isMobile && (
        <div className="fixed top-4 left-4 z-40 md:hidden">
          <SidebarTrigger />
        </div>
      )}

      <Sidebar className="relative max-h-full pb-16">
        <SidebarHeader className="flex items-center justify-between p-4  ">
          <div className="flex items-center gap-2 w-full">
            <Avatar className="w-8 h-8">
              <AvatarImage src={organization?.logoUrl} />
              <AvatarFallback>{organization?.name?.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <span className="font-semibold">
              {organization?.name || "Organization"}
            </span>
          </div>
          {isMobile && <SidebarTrigger />}
        </SidebarHeader>

        <SidebarContent>
          <SidebarMenu>
            {OrganizationNavbarItems.map((item) => {
              const isActive = pathname === item.href(orgId);

              return (
                <SidebarMenuItem key={item.value}>
                  <SidebarMenuButton
                    asChild
                    isActive={isActive}
                    tooltip={item.label}
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
              <span className="text-sm">Back to Organizations</span>
            </div>
          </Link>
        </SidebarFooter>
      </Sidebar>
    </>
  );
}
