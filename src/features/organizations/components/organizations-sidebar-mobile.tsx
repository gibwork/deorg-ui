"use client";
import React from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import { MenuIcon, X } from "lucide-react";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { OrganizationNavbarItems } from "@/constants/data";
import { ClerkLoading, ClerkLoaded, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Icons } from "@/components/icons";
import { SideBarLoading } from "@/components/layout/sidebar";
import { useParams, usePathname } from "next/navigation";

export function OrganizationSidebarMobile({
  isOpen,
  setOpen,
}: {
  isOpen: boolean;
  setOpen: (open: boolean) => void;
}) {
  const params = useParams();
  const organizationId = params.orgId as string;
  const pathname = usePathname();

  const activeTab = pathname.split("?")[1]?.split("=")[1] || "overview";

  const { user } = useUser();

  if (!user?.id || !isOpen) {
    return null;
  }

  return (
    <>
      <Sheet open={isOpen} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <MenuIcon className="h-6 w-6" />
        </SheetTrigger>
        <SheetContent side="left" className="!px-0">
          <SheetTitle className="sr-only">Navigation Menu</SheetTitle>
          <SheetClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-secondary">
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </SheetClose>
          <div className="flex items-center px-4">
            <Link href="/" className="flex items-center">
              <Icons.workLogo
                width={32}
                height={32}
                className="rounded-md me-2 mt-1 dark:bg-white"
              />
              <h2 className="text-2xl md:text-4xl font-bold tracking-tight">
                DeOrg
              </h2>
            </Link>
          </div>

          <Separator className="mt-2" />

          <div className="flex flex-col h-[calc(100vh-80px)]">
            <ClerkLoading>
              <SideBarLoading />
            </ClerkLoading>
            <ClerkLoaded>
              <>
                <div className="space-y-2 px-2 overflow-y-auto flex-1 mt-2">
                  {OrganizationNavbarItems.map((item) => (
                    <Link
                      key={item.value}
                      onClick={() => setOpen(false)}
                      href={`${
                        item.value === "overview"
                          ? `/organizations/${organizationId}`
                          : `/organizations/${organizationId}?tab=${item.value}`
                      }`}
                      className={cn(
                        "w-full text-left ",
                        activeTab === item.value && "bg-accent"
                      )}
                    >
                      <span className="group rounded-lg text-[1rem] font-medium flex items-center px-3 py-2 hover:bg-accent hover:text-accent-foreground duration-300 ease-in-out">
                        <item.icon className="h-4 w-4 mr-2" />
                        <span>{item.label}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              </>
            </ClerkLoaded>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
