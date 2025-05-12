"use client";
import React, { useEffect, useState } from "react";
import { navItems, OrganizationNavbarItems } from "@/constants/data";
import { cn } from "@/lib/utils";
import { SidebarNavItems } from "./sidebar-nav-items";
import { Button, buttonVariants } from "../ui/button";
import Link from "next/link";
import { useUser } from "@clerk/nextjs";
import { Icons } from "../icons";
import { useParams, usePathname } from "next/navigation";
import { Skeleton } from "../ui/skeleton";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { LogIn } from "lucide-react";
import { useWallet } from "@solana/wallet-adapter-react";

export default function Sidebar() {
  const queryClient = useQueryClient();
  const pathname = usePathname();
  const params = useParams();
  const { user, isLoaded } = useUser();
  const { publicKey, disconnect } = useWallet();
  let usdcAmountUserHasEarned = "$0.00";

  const activeTab = pathname.split("?")[1]?.split("=")[1] || "overview";
  const userData = queryClient.getQueryData<User>([`user-${user?.id}`]);

  if (userData?.totalAmountEarned && !isNaN(userData.totalAmountEarned)) {
    usdcAmountUserHasEarned = "$" + userData.totalAmountEarned.toFixed(2);
  }

  if (!user?.id) {
    return null;
  }

  return (
    <nav
      className={cn(
        `relative hidden h-screen border-r border-stone-200 dark:border-zinc-800 lg:block min-w-[17rem] pb-0`
      )}
    >
      {!isLoaded ? (
        <SideBarLoading />
      ) : (
        <div className="flex flex-col h-full relative">
          <>
            <div className="space-y-2 px-2 overflow-y-auto flex-1 mt-2">
              {OrganizationNavbarItems.map((item) => (
                <Link
                  key={item.value}
                  href={`${
                    item.value === "overview"
                      ? `/organizations/${params.orgId}`
                      : `/organizations/${params.orgId}?tab=${item.value}`
                  }`}
                  className={"mt-1"}
                >
                  <span
                    className={cn(
                      "group rounded-lg text-[1rem] font-medium flex items-center px-3 py-1.5 hover:bg-accent hover:text-accent-foreground duration-300 ease-in-out",
                      activeTab === item.value
                        ? "bg-accent font-semibold"
                        : "transparent text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4 mr-2" />
                    <span>{item.label}</span>
                  </span>
                </Link>
              ))}
            </div>
          </>
        </div>
      )}
    </nav>
  );
}

export const SideBarLoading = () => {
  return (
    <>
      <div className="text-center rounded-md font-bold text-[2rem]  p-3">
        <div className="flex items-center space-x-1 pb-2">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-10 w-full" />
          </div>
        </div>
        <div className="flex justify-center text-sm font-light leading-3">
          <Skeleton className="h-4 w-[100px] mx-3" />
        </div>
      </div>
      <div className=" flex flex-col m-1 mb-6 items-center">
        <Skeleton
          className={cn("w-10/12", buttonVariants({ variant: "secondary" }))}
        />
      </div>

      <div className="space-y-4 px-2">
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-9 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-9 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Skeleton className="h-8 w-9 rounded-full" />
          <div className="space-y-2 w-full">
            <Skeleton className="h-6 w-full" />
          </div>
        </div>
      </div>
    </>
  );
};
