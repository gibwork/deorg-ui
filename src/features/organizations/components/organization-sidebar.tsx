"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { ChevronDown, Globe, Settings, Users, LogOut } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import { OrganizationNavbarItems } from "@/constants/data";
import { useOrganization } from "../hooks/use-organization";

import { Icons } from "@/components/icons";
import { useOrganizationProjects } from "../hooks/use-organization-projects";
import { SlimOrgSidebar } from "./slim-org-sidebar";
import Image from "next/image";
import { useMediaQuery } from "usehooks-ts";
import { useMemberTasks } from "../hooks/use-member-tasks";
import { TaskStatus } from "@/types/types.task";
import { Skeleton } from "@/components/ui/skeleton";

export function OrganizationSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { data: organization, isLoading } = useOrganization(orgId);
  const { data: projectsData } = useOrganizationProjects(orgId, "active");
  const { data: tasksData } = useMemberTasks();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  //Get Total Earned in USDC
  function getTotalUSDCInTreasury() {
    let amount = 0;
    organization?.treasuryBalances?.forEach((balance) => {
      if (balance?.token?.symbol === "USDC") {
        const decimals = balance?.token.decimals;
        if (balance?.raw && balance?.raw > 0) {
          const usdAmount = balance?.raw / 10 ** decimals;
          amount += usdAmount;
        }
      }
    });

    return amount.toFixed(2);
  }

  // Show skeleton while loading
  if (isLoading || !organization) {
    return (
      <>
        {!isMobile && (
          <div className="fixed top-4 left-4 z-40 md:hidden">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        )}

        <SlimOrgSidebar />
        <OrganizationSidebarSkeleton isMobile={isMobile} />
      </>
    );
  }

  return (
    <>
      {!isMobile && (
        <div className="fixed top-4 left-4 z-40 md:hidden">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <SlimOrgSidebar />

      <div
        className={`${
          isMobile ? "w-20" : "w-64"
        } h-screen flex-shrink-0 flex flex-col`}
      >
        {/* Header */}
        <div className="p-0 bg-white flex-shrink-0">
          <div
            className={`flex flex-row border-b border-r border-stone-200 h-[50px] p-1 hover:bg-black ${
              dropdownOpen ? "bg-black text-white" : ""
            } transition-all duration-300 hover:text-white hover:cursor-pointer`}
            onClick={() => (!isMobile ? setDropdownOpen(!dropdownOpen) : null)}
          >
            <div
              className={`flex flex-col ${
                isMobile ? "w-full" : "w-1/5"
              } justify-center items-center`}
            >
              <Image
                src={organization?.metadata?.logoUrl ?? organization?.logoUrl}
                alt={organization?.name}
                width={42}
                height={42}
                className="rounded-lg p-1"
              />
            </div>
            {!isMobile && (
              <div className="flex flex-col w-4/5">
                <div className="flex items-center justify-between">
                  <span className="text-2xl font-medium overflow-hidden text-ellipsis whitespace-nowrap align-baseline mt-1">
                    {organization?.name}
                  </span>
                  <div className="mt-2">
                    <ChevronDown
                      className={`h-6 w-6 transition-transform ms-1 ${
                        dropdownOpen
                          ? "rotate-180 transition-all duration-300"
                          : ""
                      }`}
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
          {dropdownOpen && organization.metadata && !isMobile && (
            <div className="border-b border-r border-stone-200">
              {organization.metadata.twitterUrl && (
                <Link
                  href={organization.metadata.twitterUrl}
                  className="flex items-center px-4 py-3 text-sm font-medium border-b border-stone-200 text-stone-600 group hover:bg-stone-50 hover:text-black transition-all duration-300"
                  target="_blank"
                >
                  <Icons.twitter
                    className="h-4 w-4 me-4 group-hover:fill-black transition-all duration-300"
                    fill="gray"
                  />
                  Follow on X
                </Link>
              )}
              {organization.metadata.discordUrl && (
                <Link
                  href={organization.metadata.discordUrl}
                  className="flex items-center px-4 py-3 text-sm font-medium border-b border-stone-200 text-stone-600 group hover:bg-stone-50 hover:text-black transition-all duration-300"
                  target="_blank"
                >
                  <Icons.discord
                    className="h-4 w-4 me-4 group-hover:fill-black transition-all duration-300"
                    fill="gray"
                  />
                  Join Discord
                </Link>
              )}
              {organization.metadata.websiteUrl && (
                <Link
                  href={organization.metadata.websiteUrl}
                  className="flex items-center px-4 py-3 text-sm font-medium border-b border-stone-200 text-stone-600 group hover:bg-stone-50 hover:text-black transition-all duration-300"
                  target="_blank"
                >
                  <Globe
                    className="h-4 w-4 me-4 group-hover:stroke-black transition-all duration-300"
                    stroke="gray"
                  />
                  Visit Website
                </Link>
              )}
            </div>
          )}
          {!isMobile ? (
            <div className="flex flex-row text-center h-[70px] border-b border-r">
              <div className="flex flex-col w-1/3 border-r">
                <div className="p-2 py-4 flex flex-col items-center justify-center font-light">
                  {organization.contributors?.length || 0}
                  <span className="text-xs font-semibold">contributors</span>
                </div>
              </div>
              <div className="flex flex-col w-1/3 border-r">
                <div className="p-2 py-4 flex flex-col items-center justify-center font-light">
                  {organization.members?.length || 0}
                  <span className="text-xs font-semibold">followers</span>
                </div>
              </div>
              <div className="flex flex-col w-1/3 border-r">
                <div className="p-2 py-4 flex flex-col items-center justify-center font-light">
                  {getTotalUSDCInTreasury()}
                  <span className="text-xs font-semibold">treasury</span>
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* Content */}
        <div className="border-r overflow-y-auto flex-1">
          <nav className="">
            {OrganizationNavbarItems.map((item) => {
              if (item.value === "projects") {
                const isProjectsActive =
                  pathname === item.href(orgId) ||
                  pathname.includes(`/organizations/${orgId}/projects/`);

                // On mobile, always show a simple link that goes to the projects page
                if (isMobile || !projectsData?.activeProjects?.length) {
                  return (
                    <Link
                      key={item.value}
                      href={item.href(orgId)}
                      className={cn(
                        "flex items-center py-3 text-sm font-medium border-b border-stone-200",
                        isProjectsActive
                          ? "bg-stone-100 text-black"
                          : "text-black hover:bg-stone-50",
                        isMobile ? "justify-center w-full px-2" : "px-4"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4",
                          isProjectsActive && "stroke-black",
                          !isMobile && "mr-3"
                        )}
                      />
                      {!isMobile && item.label}
                    </Link>
                  );
                }

                // Only show the accordion on desktop
                return (
                  <div key={item.value} className="border-b border-stone-200">
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                      defaultValue={isProjectsActive ? "projects" : undefined}
                    >
                      <AccordionItem value="projects" className="border-none">
                        <AccordionTrigger
                          className={cn(
                            "py-3 px-4 hover:bg-stone-100 text-sm",
                            isProjectsActive && "bg-stone-100"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon
                              className={cn(
                                "h-4 w-4 mr-1",
                                isProjectsActive && "stroke-black"
                              )}
                            />
                            <span
                              className={cn(isProjectsActive && "!text-black")}
                            >
                              Projects
                            </span>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex flex-col gap-2 ml-10 mt-1">
                            {projectsData?.activeProjects?.map(
                              (project: any) => (
                                <Link
                                  key={project.uuid || project.accountAddress}
                                  href={`/organizations/${orgId}/projects/${project.accountAddress}`}
                                  className={cn(
                                    "flex px-2 py-1 text-sm rounded-md items-center",
                                    pathname ===
                                      `/organizations/${orgId}/projects/${project.accountAddress}`
                                      ? "text-sidebar-accent-foreground font-medium"
                                      : "hover:bg-sidebar-accent/50"
                                  )}
                                >
                                  {project.title.length > 20
                                    ? project.title.substring(0, 20) + "..."
                                    : project.title}
                                </Link>
                              )
                            )}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                );
              }

              const isActive = pathname === item.href(orgId);

              return (
                <Link
                  key={item.value}
                  href={item.href(orgId)}
                  className={cn(
                    "flex items-center py-3 text-sm font-medium border-b border-stone-200",
                    isActive
                      ? "bg-stone-100 text-black"
                      : "text-black hover:bg-stone-50",
                    isMobile ? "justify-center w-full px-2" : "px-4"
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4",
                      isActive && "stroke-black",
                      !isMobile && "mr-3"
                    )}
                  />
                  {!isMobile && item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}

// Loading skeleton component for the sidebar
function OrganizationSidebarSkeleton({ isMobile }: { isMobile: boolean }) {
  return (
    <div
      className={`${
        isMobile ? "w-20" : "w-64"
      } h-screen flex-shrink-0 flex flex-col`}
    >
      {/* Header Skeleton */}
      <div className="p-0 bg-white flex-shrink-0">
        <div className="flex flex-row border-b border-r border-stone-200 h-[50px] p-1">
          <div
            className={`flex flex-col ${
              isMobile ? "w-full" : "w-1/5"
            } justify-center items-center`}
          >
            <Skeleton className="w-[42px] h-[42px] rounded-lg" />
          </div>
          {!isMobile && (
            <div className="flex flex-col w-4/5">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-32 mt-1" />
                <Skeleton className="h-6 w-6 mt-2" />
              </div>
            </div>
          )}
        </div>

        {/* Stats skeleton for desktop */}
        {!isMobile && (
          <div className="flex flex-row text-center h-[70px] border-b border-r">
            <div className="flex flex-col w-1/3 border-r">
              <div className="p-2 py-4 flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex flex-col w-1/3 border-r">
              <div className="p-2 py-4 flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-4 w-6" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
            <div className="flex flex-col w-1/3 border-r">
              <div className="p-2 py-4 flex flex-col items-center justify-center gap-1">
                <Skeleton className="h-4 w-8" />
                <Skeleton className="h-3 w-16" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation skeleton */}
      <div className="border-r overflow-y-auto flex-1">
        <nav className="">
          {Array.from({ length: 5 }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "flex items-center py-3 border-b border-stone-200",
                isMobile ? "justify-center w-full px-2" : "px-4"
              )}
            >
              <Skeleton className="h-4 w-4" />
              {!isMobile && <Skeleton className="h-4 w-20 ml-3" />}
            </div>
          ))}
        </nav>
      </div>
    </div>
  );
}
