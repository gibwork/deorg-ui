import React, { Suspense } from "react";
import { OrganizationHeader } from "@/features/organizations/components/organization/organization-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrganizationNav } from "@/features/organizations/components/organization/organization-nav";
import Sidebar from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { OrganizationSidebar } from "@/features/organizations/components/organization-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
import { auth } from "@clerk/nextjs/server";
import { Unauthorized } from "./unathorized";

function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  const { userId } = auth();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
        <OrganizationSidebar orgId={params.orgId} />

        <div className="flex-1 w-full">
          <OrganizationHeader organizationId={params.orgId} />
          <div className="container py-0 px-4 md:px-6 pb-10">
            <div className="h-[calc(100vh-1rem)] ">
              <ScrollArea className="h-full">
                <div className="mt-6 w-3/4 mx-auto ">
                  <Unauthorized orgId={params.orgId}>{children}</Unauthorized>
                </div>
              </ScrollArea>
            </div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default OrganizationLayout;
