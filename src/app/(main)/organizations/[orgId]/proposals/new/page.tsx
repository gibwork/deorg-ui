import React from "react";
import NewProposalForm from "./new-proposal-form";

function page({ params }: { params: { orgId: string } }) {
  return <NewProposalForm orgId={params.orgId} />;
}

export default page;
