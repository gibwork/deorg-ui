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
  ChevronDown,
  FolderKanban,
  Globe,
} from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useSidebar } from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import { OrganizationNavbarItems } from "@/constants/data";
import { useOrganization } from "../hooks/use-organization";
import { OrgsSwitcher } from "./orgs-switcher";
import { Icons } from "@/components/icons";
import { useMemo, useState } from "react";
import { useOrganizationProjects } from "../hooks/use-organization-projects";
import { SlimOrgSidebar } from "./slim-org-sidebar";
import { SideBarLoading } from "@/components/layout/sidebar";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useMediaQuery } from "usehooks-ts";

export function OrganizationSidebar({ orgId }: { orgId: string }) {
  const pathname = usePathname();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const { data: organization } = useOrganization(orgId);
  const { data: projectsData } = useOrganizationProjects(orgId, "active");

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
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
      )}

      <SlimOrgSidebar orgId={organization!.accountAddress!} />

      <div className=" w-64 h-screen flex flex-col ">
        {/* Header */}
        <div className="p-0 bg-white flex-shrink-0 ">
          <div className="flex flex-row border-b border-stone-200 h-[50px] p-1">
            <div className="h-[42px] w-[42px]">
              {organization?.metadata?.logoUrl ? (
                <Image
                  src={organization?.metadata?.logoUrl ?? ""}
                  alt={organization.name}
                  width={42}
                  height={42}
                  className="rounded-lg p-1"
                />
              ) : (
                <Skeleton className="h-8 w-8 m-1 rounded-sm bg-stone-200" />
              )}
            </div>
            <div className="flex flex-col ms-2 ">
              <h1 className="font-bold text-black">{organization.name}</h1>
              {organization.metadata && (
                <div className="flex flex-row items-center gap-2 opacity-60 cursor-pointer">
                  {organization.metadata.twitterUrl && (
                    <Link
                      href={organization.metadata.twitterUrl}
                      target="_blank"
                    >
                      <span className="text-stone-500 cursor-pointer hover:fill-black">
                        <Icons.twitter
                          className="h-[.85rem] w-[.85rem]"
                          fill="gray"
                        />
                      </span>
                    </Link>
                  )}
                  {organization.metadata.discordUrl && (
                    <Link
                      href={organization.metadata.discordUrl}
                      target="_blank"
                    >
                      <span className="text-stone-500 cursor-pointer hover:fill-black">
                        <Icons.discord
                          className="h-[.85rem] w-[.85rem]"
                          fill="gray"
                        />
                      </span>
                    </Link>
                  )}
                  {organization.metadata.websiteUrl && (
                    <Link
                      href={organization.metadata.websiteUrl}
                      target="_blank"
                    >
                      <span className="text-stone-500 cursor-pointer hover:stroke-black">
                        <Globe
                          className="h-[.85rem] w-[.85rem]"
                          stroke="gray"
                        />
                      </span>
                    </Link>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center justify-center py-2 border-b border-r">
            <div className="flex flex-row items-center gap-2">
              <Icons.usdc className="h-8 w-8" />
              <span className="text-3xl font-bold text-black">$100.17</span>
            </div>
            <span className="text-sm text-stone-500">Total Earned</span>
          </div>
        </div>

        {/* Content */}
        <div className="border-r overflow-y-auto flex-1">
          <nav className="">
            {OrganizationNavbarItems.map((item) => {
              if (item.value === "projects") {
                const isProjectsActive =
                  pathname === item.href(orgId) ||
                  pathname.includes(`/organizations/${orgId}/projects/`);

                if (!projectsData?.activeProjects?.length) {
                  return (
                    <Link
                      key={item.value}
                      href={item.href(orgId)}
                      className={cn(
                        "flex items-center px-4 py-3 text-sm font-medium border-b border-stone-200",
                        isProjectsActive
                          ? "bg-stone-100 text-black"
                          : "text-stone-600 hover:bg-stone-50"
                      )}
                    >
                      <item.icon
                        className={cn(
                          "h-4 w-4 mr-3",
                          isProjectsActive && "stroke-black"
                        )}
                      />
                      {item.label}
                    </Link>
                  );
                }

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
                            "py-3 px-4 hover:bg-stone-100",
                            isProjectsActive && "bg-stone-100"
                          )}
                        >
                          <div className="flex items-center gap-2">
                            <item.icon
                              className={cn(
                                "h-4 w-4",
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
                    "flex items-center px-4 py-3 text-sm font-medium border-b border-stone-200",
                    isActive
                      ? "bg-stone-100 text-black"
                      : "text-stone-600 hover:bg-stone-50"
                  )}
                >
                  <item.icon
                    className={cn("h-4 w-4 mr-3", isActive && "stroke-black")}
                  />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer */}
        {/* <div className="p-4 bg-white border-t border-stone-200 flex-shrink-0">
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
        </div> */}
      </div>
    </>
  );
}
