import { Suspense } from "react";
import { OrganizationProjects } from "@/features/organizations/components/organization/organization-projects";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { getQueryClient } from "@/components/providers/query";
import { getOrganizationProjects } from "@/features/organizations/actions/projects/get-organization-projects";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationProjectsPage params={params} />
    </Suspense>
  );
}

async function OrganizationProjectsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["organization_projects", params.orgId],
    queryFn: async () => {
      const organizationProjects = await getOrganizationProjects(
        params.orgId,
        1,
        "active"
      );
      if (organizationProjects.error)
        throw new Error(organizationProjects.error.message);
      return organizationProjects.success;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="h-[calc(100vh-4rem)]">
        <ScrollArea className="h-full">
          <OrganizationProjects organizationId={params.orgId} />
        </ScrollArea>
      </div>
    </HydrationBoundary>
  );
}
