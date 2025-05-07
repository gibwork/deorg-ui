import OrganizationAssets from "@/features/organizations/components/organization/organization-assets";
import React from "react";

function page({ params }: { params: { orgId: string } }) {
  return <OrganizationAssets orgId={params.orgId} />;
}

export default page;
