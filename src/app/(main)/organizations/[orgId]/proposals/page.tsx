import { Suspense } from "react";
import { OrganizationProposals } from "@/features/organizations/components/organization/organization-proposals";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getOrganizationProposals } from "@/features/organizations/actions/proposals/get-organization-proposals";
import { getQueryClient } from "@/components/providers/query";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationProposalsPage params={params} />
    </Suspense>
  );
}

async function OrganizationProposalsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
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
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-[calc(100vh-4rem)]">
        <ScrollArea className="h-full">
          <OrganizationProposals organizationId={params.orgId} />
        </ScrollArea>
      </div>
    </HydrationBoundary>
  );
}
