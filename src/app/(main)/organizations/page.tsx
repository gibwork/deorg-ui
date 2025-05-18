import { getQueryClient } from "@/components/providers/query";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { getAllOrganizations } from "@/features/organizations/actions/get-all-organizations";
import OrganizationsList from "@/features/organizations/components/organizations-list";
import { HydrationBoundary } from "@tanstack/react-query";
import { Suspense } from "react";
import { dehydrate } from "@tanstack/react-query";
import { ScrollArea } from "@/components/ui/scroll-area";

export default function page() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Organizations />
    </Suspense>
  );
}

async function Organizations() {
  const queryClient = getQueryClient();
  await queryClient.prefetchQuery({
    queryKey: ["organizations"],
    queryFn: async () => {
      const organizations = await getAllOrganizations();
      if (organizations.error) throw new Error(organizations.error);
      return organizations.success;
    },
  });

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <ScrollArea className="h-full">
        <OrganizationsList />
      </ScrollArea>
    </HydrationBoundary>
  );
}
