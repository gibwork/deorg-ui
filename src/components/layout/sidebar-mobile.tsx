"use client";
import React, { useEffect } from "react";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "../ui/sheet";

import { LogIn, MenuIcon, X } from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { Separator } from "../ui/separator";
import { SidebarNavItems } from "./sidebar-nav-items";
import { gibworkTotalVolume, navItems } from "@/constants/data";
import { ClerkLoading, ClerkLoaded, useUser } from "@clerk/nextjs";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Icons } from "../icons";
import { SideBarLoading } from "./sidebar";
import { useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { useAuthModal } from "@/hooks/use-auth-modal";
import { useWallet } from "@solana/wallet-adapter-react";
import { usePathname } from "next/navigation";
import { OrganizationSidebarMobile } from "@/features/organizations/components/organizations-sidebar-mobile";
interface SidebarProps extends React.HTMLAttributes<HTMLDivElement> {}

export function MobileSidebar({ className }: SidebarProps) {
  const queryClient = useQueryClient();
  const pathname = usePathname();

  const [open, setOpen] = useState(false);
  const { user, isLoaded } = useUser();
  const { onOpen } = useAuthModal();
  const { disconnect } = useWallet();
  let usdcAmountUserHasEarned = "$0.00";

  const userData = queryClient.getQueryData<User>([`user-${user?.id}`]);

  if (userData?.totalAmountEarned && !isNaN(userData.totalAmountEarned)) {
    usdcAmountUserHasEarned = "$" + userData.totalAmountEarned.toFixed(2);
  }
  const isOrganizationRoute = pathname.startsWith("/organizations");

  if (!user?.id) {
    return null;
  }

  if (isOrganizationRoute) {
    return <OrganizationSidebarMobile isOpen={open} setOpen={setOpen} />;
  }

  return (
    <>
      <Sheet open={open} onOpenChange={setOpen}>
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
                gibwork
              </h2>
            </Link>
          </div>

          <Separator className="mt-2" />

          <div className="flex flex-col h-[calc(100vh-80px)]">
            <ClerkLoading>
              <SideBarLoading />
            </ClerkLoading>
            <ClerkLoaded>
              {user ? (
                <>
                  <div className="text-center rounded-md font-bold text-[2rem] m-2 p-3">
                    <div className="flex justify-center">
                      <div className="my-auto me-1">
                        <Icons.usdc />
                      </div>
                      <div>
                        <span className="text-center ">
                          {usdcAmountUserHasEarned}
                        </span>
                      </div>
                    </div>
                    <div className="text-sm font-light leading-3">
                      total earned
                    </div>
                  </div>
                  <div className="m-1 mb-6">
                    <Link href="/create-work" className="p-4">
                      <Button
                        type="button"
                        className=" w-10/12 shadow-md"
                        onClick={() => {
                          setOpen(false);
                        }}
                      >
                        CREATE
                      </Button>
                    </Link>
                  </div>
                  <div className="space-y-4 px-2 overflow-y-auto flex-1">
                    <SidebarNavItems items={navItems} setOpen={setOpen} />
                  </div>

                  {/* Account notification prompts */}
                  <div className="mt-auto">
                    {!userData?.primaryWallet ? (
                      <div className="m-3 p-3 bg-purple-50 dark:bg-[#8151fd]/10 border border-purple-200 dark:border-[#8151fd]/25 rounded-md shadow-sm relative">
                        <p className="text-xs text-purple-700 dark:text-purple-300 mt-1 mb-1 pl-3">
                          Add a wallet to collect payment and rewards.
                        </p>
                        <Link
                          href={`/p/${user.username}/account`}
                          className="ms-3 text-xs font-medium text-[#8151fd] hover:text-purple-700 dark:hover:text-purple-400"
                          onClick={() => {
                            setOpen(false);
                          }}
                        >
                          Go to Account Settings →
                        </Link>
                      </div>
                    ) : !userData.xAccountVerified ? (
                      <div className="mx-3 p-3 bg-purple-50 dark:bg-[#8151fd]/10 border border-purple-200 dark:border-[#8151fd]/25 rounded-md shadow-sm relative">
                        <p className="text-xs text-purple-700 dark:text-purple-300 mb-1 pl-3">
                          Connect your X (Twitter) account to unlock features.
                        </p>
                        <Link
                          href={`/p/${user.username}/account`}
                          className="ms-3 text-xs font-medium text-[#8151fd] hover:text-purple-700 dark:hover:text-purple-400"
                          onClick={() => {
                            setOpen(false);
                          }}
                        >
                          Go to Account Settings →
                        </Link>
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <>
                  <div className="text-center rounded-md font-bold text-[2rem] m-2 p-3">
                    <div className="flex justify-center">
                      <div className="my-auto me-1">
                        <Icons.usdc />
                      </div>
                      <div>
                        <span className="text-center ">
                          {gibworkTotalVolume}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-center text-sm font-light leading-3">
                      total volume
                    </div>
                    <Button
                      variant={"theme"}
                      className="text-white text-lg font-semibold mt-5 w-full"
                      onClick={() => {
                        disconnect();
                        onOpen();
                      }}
                    >
                      <LogIn className="size-5 mr-2" />
                      Sign In
                    </Button>
                  </div>
                </>
              )}
            </ClerkLoaded>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
