import { Suspense } from "react";
import { OrganizationSettings } from "@/features/organizations/components/organization/organization-settings";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OrganizationSettingsPage({
  params,
}: {
  params: { orgId: string };
}) {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationSettings organizationId={params.orgId} />
    </Suspense>
  );
}
