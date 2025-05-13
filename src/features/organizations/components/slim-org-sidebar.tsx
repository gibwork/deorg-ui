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
import { useMemo, useState } from "react";
import { useOrganization } from "../hooks/use-organization";
import { useMemberOrganizations } from "../hooks/use-member-organizations";
import { SideBarLoading } from "@/components/layout/sidebar";
import { OrganizationMetadata } from "@/types/types.organization";
import { getOrganizationDetails } from "../actions/get-organization-details";
import { Skeleton } from "@/components/ui/skeleton";

type Organization = {
  id: string;
  name: string;
  logoUrl?: string;
};

interface SlimOrgSidebarProps {
  className?: string;
  orgId: string;
}

export function SlimOrgSidebar({ orgId, className }: SlimOrgSidebarProps) {
  const pathname = usePathname();
  const { data: memberOrganizations } = useMemberOrganizations();
  const [orgMetadata, setOrgMetadata] = useState<{accountAddress: string, metadata: OrganizationMetadata}[] | null>(
    null
  );

  const organizations = useMemo(() => {
    if (memberOrganizations) {
      const orgs = memberOrganizations.map(async (org) => {
        const orgDetailsResponse = await getOrganizationDetails(org.accountAddress);
        
        if (orgDetailsResponse.success) {
          const orgMetadataData = orgDetailsResponse.success.metadata || {};
          setOrgMetadata((prev) => prev 
            ? [...prev, {accountAddress: org.accountAddress, metadata: orgMetadataData}] 
            : [{accountAddress: org.accountAddress, metadata: orgMetadataData}]);
        }
        return orgDetailsResponse;
      });      

      return memberOrganizations;
    }
    return [];
  }, [memberOrganizations]);

  if (!organizations) {
    return <>Loading...</>;
  }

  return (
    <div
      className={cn(
        "fixed top-0 left-0 z-30 flex h-full w-16 flex-col items-center border-r bg-background py-2 bg-stone-100 border-e-2",
        className
      )}
    >
      <div className="h-[50px]">
        <Link
          href="/"
          className=" flex items-center justify-center shadow-md box-shadow-md"
        >
          <Icons.workLogo width={42} height={42} className="rounded-md " />
        </Link>
      </div>

      <ScrollArea className="flex-1 w-full border-t border-stone-200 pt-6">
        <div className="flex flex-col items-center gap-4 px-2">
          {organizations &&
            organizations.map((org) => {
              const isActive = pathname.includes(
                `/organizations/${org.accountAddress}`
              );

              return (
                <TooltipProvider key={org.id} delayDuration={300}>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href={`/organizations/${org.accountAddress}`}
                        className={cn(
                          "group relative flex h-10 w-10 items-center justify-center transition-all"
                        )}
                      >
                        {orgMetadata?.find((orgMeta) => orgMeta.accountAddress === org.accountAddress)?.metadata ? (
                          <Avatar
                            className={cn(
                              "h-10 w-10 rounded-sm border-none bg-stone-200",
                              isActive ? "opacity-100" : "opacity-75"
                            )}
                          >
                            <AvatarImage 
                            src={orgMetadata?.find((orgMeta) => orgMeta.accountAddress === org.accountAddress)?.metadata?.logoUrl ?? ""} alt={org.name} />
                            <AvatarFallback>
                              <Skeleton className="h-10 w-10 border-none bg-stone-200" />
                            </AvatarFallback>
                          </Avatar>
                        ) : (
                          <div className="flex h-10 w-10 items-center justify-center bg-stone-200">
                            <Skeleton className="h-10 w-10 rounded-none bg-stone-200" />
                          </div>
                        )}
                        {isActive && (
                          <span className="absolute -right-0.5 -top-0.5 h-3 w-3 rounded-full border-2 border-background bg-primary" />
                        )}
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
