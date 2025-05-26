import React from "react";
import { OrganizationHeader } from "@/features/organizations/components/organization/organization-header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrganizationSidebar } from "@/features/organizations/components/organization-sidebar";
import { OrganizationMobileHeader } from "@/features/organizations/components/organization-mobile-header";

function OrganizationLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { orgId: string };
}) {
  return (
    <div className="flex min-h-screen w-full bg-white dark:bg-gray-900">
      {/* Desktop Sidebar - Hidden on mobile */}
      <div className="hidden md:flex">
        <OrganizationSidebar orgId={params.orgId} />
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header - Visible only on mobile */}
        <div className="md:hidden">
          <OrganizationMobileHeader organizationId={params.orgId} />
        </div>

        {/* Desktop Header - Hidden on mobile */}
        <div className="hidden md:block">
          <OrganizationHeader organizationId={params.orgId} />
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          <div className="h-[calc(100vh-1rem)] px-3 md:px-6 py-4 md:py-6">
            <ScrollArea className="h-full">
              <div className="w-full max-w-none md:max-w-4xl md:mx-auto">
                {children}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrganizationLayout;
