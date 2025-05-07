"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import Link from "next/link";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Organization } from "@/types/types.organization";
import { useRouter } from "next/navigation";
export function OrgsSwitcher({ orgs }: { orgs: any }) {
  const { isMobile } = useSidebar();
  const router = useRouter();
  const activeOrg = orgs[0];

  console.log(orgs, "orgs");
  if (!activeOrg) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <div className=" p-1 rounded-md bg-gray-100">
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                variant="default"
                className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground focus:outline-none ring-gray-100 "
              >
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg  ">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={activeOrg.logoUrl} />
                    <AvatarFallback>
                      {activeOrg.name?.slice(0, 2)}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">
                    {activeOrg.name}
                  </span>
                </div>
                <ChevronsUpDown className="ml-auto" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>
            {/* <div className="flex items-center gap-2 mt-2">
              <span className="text-xs text-muted-foreground">Threshold:</span>
              <span className="text-xs">2/3</span>
            </div> */}
          </div>

          <DropdownMenuContent
            className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
            align="start"
            side={isMobile ? "bottom" : "right"}
            sideOffset={4}
          >
            <DropdownMenuLabel className="text-xs text-muted-foreground">
              Organizations
            </DropdownMenuLabel>
            {orgs.map((org: Organization, index: number) => (
              <DropdownMenuItem
                key={index}
                onClick={() => router.push(`/organizations/${org.id}`)}
                className="gap-2 p-2"
              >
                <div className="flex size-6 items-center justify-center rounded-sm border">
                  <Avatar className="w-6 h-6">
                    <AvatarImage src={org.logoUrl} />
                    <AvatarFallback>{org.name?.slice(0, 2)}</AvatarFallback>
                  </Avatar>
                </div>
                {org.name}
                <DropdownMenuShortcut>⌘{index + 1}</DropdownMenuShortcut>
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <Link href="/organizations/new">
              <DropdownMenuItem className="gap-2 p-2">
                <div className="flex size-6 items-center justify-center rounded-md border bg-background">
                  <Plus className="size-4" />
                </div>
                <div className="font-medium text-muted-foreground">
                  Add organization
                </div>
              </DropdownMenuItem>
            </Link>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
