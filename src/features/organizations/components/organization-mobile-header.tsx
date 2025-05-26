"use client";

import { useState } from "react";
import { Menu, Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { WalletButton } from "@/components/wallet-button";
import { useOrganization } from "../hooks/use-organization";
import { OrganizationNavbarItems } from "@/constants/data";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import Link from "next/link";
import Image from "next/image";
import { SlimOrgSidebar } from "./slim-org-sidebar";
import { useOrganizationProjects } from "../hooks/use-organization-projects";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function OrganizationMobileHeader({
  organizationId,
}: {
  organizationId: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { data: organization } = useOrganization(organizationId);
  const { data: projectsData } = useOrganizationProjects(
    organizationId,
    "active"
  );

  return (
    <>
      {/* Mobile Header */}
      <div className="flex items-center justify-between p-4 border-b border-stone-200 bg-white">
        {/* Left side - Menu and Org info */}
        <div className="flex items-center gap-3">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <SheetTitle className="sr-only">Navigation Menu</SheetTitle>

              {/* Slim sidebar for organization switching */}
              <div className="flex">
                <SlimOrgSidebar />

                {/* Main navigation */}
                <div className="flex-1 flex flex-col">
                  {/* Organization header in mobile menu */}
                  {organization && (
                    <div className="p-4 border-b border-stone-200">
                      <div className="flex items-center gap-3">
                        <Image
                          src={
                            organization?.metadata?.logoUrl ??
                            organization?.logoUrl
                          }
                          alt={organization?.name}
                          width={32}
                          height={32}
                          className="rounded-lg"
                        />
                        <div>
                          <h3 className="font-semibold text-sm">
                            {organization.name}
                          </h3>
                          <p className="text-xs text-muted-foreground">
                            {organization.members?.length || 0} followers
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Navigation items */}
                  <nav className="flex-1 p-4">
                    <div className="space-y-1">
                      {OrganizationNavbarItems.map((item) => {
                        if (item.value === "projects") {
                          const isProjectsActive =
                            pathname === item.href(organizationId) ||
                            pathname.includes(
                              `/organizations/${organizationId}/projects/`
                            );

                          // If no projects, show simple link
                          if (!projectsData?.activeProjects?.length) {
                            return (
                              <Link
                                key={item.value}
                                href={item.href(organizationId)}
                                onClick={() => setIsOpen(false)}
                                className={cn(
                                  "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                                  isProjectsActive
                                    ? "bg-stone-100 text-black"
                                    : "text-stone-600 hover:bg-stone-50 hover:text-black"
                                )}
                              >
                                <item.icon className="h-4 w-4" />
                                {item.label}
                              </Link>
                            );
                          }

                          // Show accordion with projects
                          return (
                            <Accordion
                              key={item.value}
                              type="single"
                              collapsible
                              className="w-full"
                              defaultValue={
                                isProjectsActive ? "projects" : undefined
                              }
                            >
                              <AccordionItem
                                value="projects"
                                className="border-none"
                              >
                                <AccordionTrigger
                                  className={cn(
                                    "px-3 py-2 hover:bg-stone-50 rounded-lg text-sm font-medium",
                                    isProjectsActive && "bg-stone-100"
                                  )}
                                >
                                  <div className="flex items-center gap-3">
                                    <item.icon className="h-4 w-4" />
                                    <span>Projects</span>
                                  </div>
                                </AccordionTrigger>
                                <AccordionContent>
                                  <div className="ml-7 mt-1 space-y-1">
                                    {projectsData?.activeProjects?.map(
                                      (project: any) => (
                                        <Link
                                          key={
                                            project.uuid ||
                                            project.accountAddress
                                          }
                                          href={`/organizations/${organizationId}/projects/${project.accountAddress}`}
                                          onClick={() => setIsOpen(false)}
                                          className={cn(
                                            "block px-3 py-2 text-sm rounded-md transition-colors",
                                            pathname ===
                                              `/organizations/${organizationId}/projects/${project.accountAddress}`
                                              ? "bg-stone-100 text-black font-medium"
                                              : "text-stone-600 hover:bg-stone-50 hover:text-black"
                                          )}
                                        >
                                          {project.title.length > 25
                                            ? project.title.substring(0, 25) +
                                              "..."
                                            : project.title}
                                        </Link>
                                      )
                                    )}
                                  </div>
                                </AccordionContent>
                              </AccordionItem>
                            </Accordion>
                          );
                        }

                        const isActive = pathname === item.href(organizationId);

                        return (
                          <Link
                            key={item.value}
                            href={item.href(organizationId)}
                            onClick={() => setIsOpen(false)}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                              isActive
                                ? "bg-stone-100 text-black"
                                : "text-stone-600 hover:bg-stone-50 hover:text-black"
                            )}
                          >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  </nav>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          {/* Organization info */}
          {organization && (
            <div className="flex items-center gap-2">
              <Image
                src={organization?.metadata?.logoUrl ?? organization?.logoUrl}
                alt={organization?.name}
                width={24}
                height={24}
                className="rounded"
              />
              <span className="font-medium text-sm truncate max-w-32">
                {organization.name}
              </span>
            </div>
          )}
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-2">
          <Link
            href={`/organizations/${organizationId}/proposals/new`}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "flex items-center gap-1 text-xs px-3 h-7 md:h-9"
            )}
          >
            <Plus className="h-3 w-3" />
            <span className="hidden xs:inline">New Proposal</span>
          </Link>
          <WalletButton />
        </div>
      </div>
    </>
  );
}
