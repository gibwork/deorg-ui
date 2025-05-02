import { Suspense } from "react";
import { OrganizationActivity } from "@/features/organizations/components/organization/organization-activity";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OrganizationActivityPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationActivity />
    </Suspense>
  );
}
