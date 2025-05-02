import { Suspense } from "react";
import { OrganizationPayroll } from "@/features/organizations/components/organization/organization-payroll";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function OrganizationPayrollPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <OrganizationPayroll />
    </Suspense>
  );
}
