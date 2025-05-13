import React, { Suspense } from "react";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { OrganizationOverview } from "@/features/organizations/components/organization/organization-overview";
import { getQueryClient } from "@/components/providers/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { getOrganizationOverview } from "@/features/organizations/actions/get-organization-overview";
import { ScrollArea } from "@/components/ui/scroll-area";
import { getOrganizationDetails } from "@/features/organizations/actions/get-organization-details";
import { Organization } from "@/types/types.organization";
import { getOrganizationProposals } from "@/features/organizations/actions/proposals/get-organization-proposals";
function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationOverviewPage params={params} />
    </Suspense>
  );
}

export default page;

async function OrganizationOverviewPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();
  await Promise.all([
    queryClient.prefetchQuery({
      queryKey: ["organizationOverview", params.orgId],
      queryFn: async () => {
        const organization = await getOrganizationOverview(params.orgId);
        if (organization.error) throw new Error(organization.error);
        return organization.success;
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["organization", params.orgId],
      queryFn: async () => {
        const organization = await getOrganizationDetails(params.orgId);
        if (organization.error) throw new Error(organization.error);
        return organization.success as Organization;
      },
    }),
    queryClient.prefetchQuery({
      queryKey: ["organization_proposals", params.orgId],
      queryFn: async () => {
        const organizationProposals = await getOrganizationProposals(
          params.orgId,
          1,
          "active"
        );
        if (organizationProposals.error)
          throw new Error(organizationProposals.error.message);
        return organizationProposals.success;
      },
    }),
  ]);

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollArea className="h-full">
        <OrganizationOverview organizationId={params.orgId} />
      </ScrollArea>
    </HydrationBoundary>
  );
}
