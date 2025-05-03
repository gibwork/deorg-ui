import { Suspense } from "react";
import { OrganizationSettings } from "@/features/organizations/components/organization/organization-settings";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getQueryClient } from "@/components/providers/query";
import { HydrationBoundary } from "@tanstack/react-query";
import { dehydrate } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function page({ params }: { params: { orgId: string } }) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationSettingsPage params={params} />
    </Suspense>
  );
}

async function OrganizationSettingsPage({
  params,
}: {
  params: { orgId: string };
}) {
  const queryClient = getQueryClient();
  // await queryClient.prefetchQuery({
  //   queryKey: ["organization_settings", params.orgId],
  //   queryFn: async () => {
  //     const organizationSettings = await getOrganizationSettings(params.orgId);
  //     return organizationSettings.success;
  //   },
  // });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <OrganizationSettings organizationId={params.orgId} />
    </HydrationBoundary>
  );
}
