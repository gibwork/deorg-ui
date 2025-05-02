import { Suspense } from "react";
import { OrganizationTasks } from "@/features/organizations/components/organization/organization-tasks";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { HydrationBoundary } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/query";
import { getOrganizationTasks } from "@/features/organizations/actions/get-organization-tasks";
import { dehydrate } from "@tanstack/react-query";

export default function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationTasksPage params={params} />
    </Suspense>
  );
}

async function OrganizationTasksPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["organization_tasks", params.orgId],
    queryFn: async () => {
      const organization = await getOrganizationTasks(params.orgId);
      if (organization.error) throw new Error(organization.error.message);
      return organization.success;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollArea className="h-full">
        <OrganizationTasks organizationId={params.orgId} />
      </ScrollArea>
    </HydrationBoundary>
  );
}
