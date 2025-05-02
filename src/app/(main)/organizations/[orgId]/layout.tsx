import React, { Suspense } from "react";
import { OrganizationHeader } from "@/features/organizations/components/organization/organization-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrganizationNav } from "@/features/organizations/components/organization/organization-nav";
import Sidebar from "@/components/layout/sidebar";
import { SidebarProvider } from "@/components/ui/sidebar";
import { OrganizationSidebar } from "@/features/organizations/components/organization-sidebar";
import { Skeleton } from "@/components/ui/skeleton";
function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <SidebarProvider>
      <div className="w-full flex min-h-screen bg-gray-50 dark:bg-gray-900">
        <OrganizationSidebar orgId={params.orgId} />

        <div className="flex-1">
          <div className="container py-6 px-4 md:px-6">
            {/* <Suspense fallback={<Skeleton className="h-24 w-full" />}>
              <OrganizationHeader organizationId={params.orgId} />
            </Suspense> */}

            <div className="">{children}</div>
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
}

export default OrganizationLayout;
