import { Suspense } from "react";
import { OrganizationTransactions } from "@/features/organizations/components/organization/organization-transactions";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getQueryClient } from "@/components/providers/query";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
export default function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationTransactions orgId={params.orgId} />
    </Suspense>
  );
}

async function OrganizationTransactionsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();
  // await queryClient.prefetchQuery({
  //   queryKey: ["organizationTransactions", params.orgId],
  //   queryFn: async () => {
  //     const organization = await getOrganizationTransactions(params.orgId);
  //     if (organization.error) throw new Error(organization.error);
  //     return organization.success;
  //   },
  // });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrganizationTransactions orgId={params.orgId} />
    </HydrationBoundary>
  );
}
