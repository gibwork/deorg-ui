import { Suspense } from "react";
import { OrganizationMembers } from "@/features/organizations/components/organization/organization-members";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/query";
import { dehydrate } from "@tanstack/react-query";
import { getOrganizationMembers } from "@/features/organizations/actions/members/get-organization-members";

export default function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationMembersPage params={params} />
    </Suspense>
  );
}

async function OrganizationMembersPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["organization_members", params.orgId],
    queryFn: async () => {
      const organizationMembers = await getOrganizationMembers(params.orgId);
      if (organizationMembers.error)
        throw new Error(organizationMembers.error.message);
      return organizationMembers.success;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrganizationMembers organizationId={params.orgId} />
    </HydrationBoundary>
  );
}
