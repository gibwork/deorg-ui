"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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

  if (!memberOrganizations) {
    return <SideBarLoading />;
  }

  if (error) {
    return (
      <div
        className={cn(
          " z-30 flex h-full w-16 flex-col items-center border-r bg-background py-2 bg-stone-100 border-e-2",
          className
        )}
      >
        <div className="flex flex-col items-center gap-4 px-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-10 rounded-sm bg-stone-200" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        " bg-background p-1 z-30 flex h-screen w-16 flex-col items-center border-r  py-2  border-e-2",
        className
      )}
    >
      <div className="h-[50px]">
        <Link
          href="/"
          className="flex items-center justify-center shadow-md box-shadow-md"
        >
          <img src="https://deorg-dev.s3.us-east-1.amazonaws.com/deorg-logo.jpg" className="h-10 w-10 rounded-md" />
        </Link>
      </div>

      <ScrollArea className="flex-1 w-full pt-6">
        <div className="flex flex-col items-center gap-4 px-2">
          {isLoading
            ? Array.from({ length: 3 }).map((_, i) => (
                <Skeleton
                  key={i}
                  className="h-10 w-10 rounded-sm bg-stone-200"
                />
              ))
            : memberOrganizations.map((org) => {
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
                                    "/images/usdc-icon.png"
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
              })}
        </div>
      </ScrollArea>
    </div>
  );
}
