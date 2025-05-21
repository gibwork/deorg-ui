"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { cn, truncate } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Icons } from "@/components/icons";
import { useMemberOrganizations } from "../hooks/use-member-organizations";
import { SideBarLoading } from "@/components/layout/sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
import { useAuth } from "@clerk/nextjs";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { Button } from "@/components/ui/button";
import { Organization } from "@/types/types.organization";
import { getAllOrganizations } from "../actions/get-all-organizations";
import { useQuery } from "@tanstack/react-query";

interface SlimOrgSidebarProps {
  className?: string;
  orgId: string;
}

export function SlimOrgSidebar({ orgId, className }: SlimOrgSidebarProps) {
  const pathname = usePathname();
  const {
    data: memberOrganizations,
    isLoading,
    error,
  } = useMemberOrganizations();

  const { data: organizations } = useQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const organizations = await getAllOrganizations();
      return organizations.success;
    },
  });

  const { publicKey, disconnect } = useWallet();
  const { userId, signOut, isSignedIn } = useAuth();
  const walletModal = useWalletModal();

  //get solana balance
  const { data } = useWalletTokenBalances();
  const solanaBalance = () => {
    const solanaBalance = data?.find((token) => token.symbol === "SOL");
    if (!solanaBalance) return "No Sol";

    //convert decimal places using tokenInfo.decimals
    const balance = solanaBalance?.tokenInfo.balance / 10 ** solanaBalance?.tokenInfo.decimals;
    return balance;
  };

  return (
    <div
      className={cn(
        " bg-background p-1 z-30 flex h-screen w-16 flex-col items-center border-r  py-2  border-e-2",
        className
      )}
    >
      <ScrollArea className="flex-1 w-full">
        <div className="flex flex-col items-center gap-4 px-2">
          {!memberOrganizations && isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
              <Skeleton
                key={i}
                className="h-10 w-10 rounded-sm bg-stone-200"
              />
            ))
            : (isSignedIn && publicKey
              ? memberOrganizations?.map((org) => {
                const isActive = pathname.includes(
                  `/organizations/${org.accountAddress}`
                );

                return (
                  <TooltipProvider key={org.id} delayDuration={300}>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Link
                          href={`/organizations/${org.accountAddress}`}
                          className="group relative flex items-center"
                        >
                          {isActive && (
                            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 z-50 rounded-full border-2 border-background bg-primary" />
                          )}
                          <div
                            className={cn(
                              "relative group flex size-10 rounded-[6px] group-hover:rounded-[10px] transition-all overflow-hidden",
                              isActive && "bg-primary/10 text-primary"
                            )}
                          >
                            <div className="w-full h-full">
                              <Avatar
                                className={cn(
                                  "h-10 w-10 rounded-sm border-none ",
                                  isActive ? "opacity-100" : "opacity-75"
                                )}
                              >
                                <AvatarImage
                                  src={org?.metadata?.logoUrl ?? org?.logoUrl}
                                  alt={org.name}
                                />
                                <AvatarFallback>
                                  <Skeleton className="h-10 w-10 border-none bg-stone-200" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="center"
                        className="font-medium"
                      >
                        {truncate(org.accountAddress, 6, 4)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              })
              : organizations?.map((org: Organization) => {
                  const isActive = pathname.includes(
                    `/organizations/${org.accountAddress}`
                  );

                  return (
                    <TooltipProvider key={org.id} delayDuration={300}>
                      <Tooltip>
                        <TooltipTrigger asChild>
                        <Link
                          href={`/organizations/${org.accountAddress}`}
                          className="group relative flex items-center"
                        >
                          {isActive && (
                            <span className="absolute -right-0.5 -top-0.5 h-3 w-3 z-50 rounded-full border-2 border-background bg-primary" />
                          )}
                          <div
                            className={cn(
                              "relative group flex size-10 rounded-[6px] group-hover:rounded-[10px] transition-all overflow-hidden",
                              isActive && "bg-primary/10 text-primary"
                            )}
                          >
                            <div className="w-full h-full">
                              <Avatar
                                className={cn(
                                  "h-10 w-10 rounded-sm border-none ",
                                  isActive ? "opacity-100" : "opacity-75"
                                )}
                              >
                                <AvatarImage
                                  src={
                                    org?.metadata?.logoUrl ??
                                    org.token?.imageUrl!
                                  }
                                  alt={org.name}
                                />
                                <AvatarFallback>
                                  <Skeleton className="h-10 w-10 border-none bg-stone-200" />
                                </AvatarFallback>
                              </Avatar>
                            </div>
                          </div>
                        </Link>
                      </TooltipTrigger>
                      <TooltipContent
                        side="right"
                        align="center"
                        className="font-medium"
                      >
                        {truncate(org.accountAddress, 6, 4)}
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                );
              }))}
        </div>
      </ScrollArea>

      <div className="mb-9 relative bg-black rounded-l-lg group">
        {isSignedIn && publicKey ? (
          <div className="w-[50px] h-[55px] rounded-full p-2">
            <Image
              src={`https://api.dicebear.com/9.x/identicon/svg?seed=${publicKey?.toString()}`}
              alt="User Avatar"
              className="rounded-full bg-black opacity-80 group-hover:opacity-100 transition-all"
              width={50}
              height={50}
            />
            <div className="absolute left-[50px] bottom-0 bg-black text-white py-2 px-4 rounded-r-lg h-[55px] w-[255px] z-40 flex flex-col justify-center whitespace-nowrap">
              <div className="flex flex-col justify-between">
                <div className="font-medium">
                  {truncate(publicKey?.toString() ?? "", 6, 4)}
                </div>
                <div className="text-xs text-stone-300 flex items-center">
                  {solanaBalance()}
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="w-[50px] h-[55px] rounded-full p-2">
            <div className="absolute left-[50px] bottom-0 bg-black text-white py-2 px-4 rounded-r-lg h-[55px] w-[255px] z-40 flex flex-col justify-center whitespace-nowrap">
              <div className="flex flex-col justify-between text-base font-bold hover:cursor-pointer hover:bg-black/10 transition-all p-2 rounded-md" onClick={() => walletModal.setVisible(true)}>
                CONNECT WALLET
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
