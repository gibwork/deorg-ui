import React from "react";
import { OrganizationHeader } from "@/features/organizations/components/organization/organization-header";
import { ScrollArea } from "@/components/ui/scroll-area";

import { OrganizationSidebar } from "@/features/organizations/components/organization-sidebar";

function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
      <OrganizationSidebar orgId={params.orgId} />

      <div className="flex-1">
        <OrganizationHeader organizationId={params.orgId} />
        <div className="container py-0 px-4 md:px-6 pb-10">
          <div className="h-[calc(100vh-1rem)] ">
            <ScrollArea className="h-full">
              <div className="mt-6 w-3/4 mx-auto ">{children} </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationLayout;
