import ProjectDetailsPage from "@/features/organizations/components/projects/project-details-page";
import React from "react";

function page({ params }: { params: { orgId: string; projectId: string } }) {
  return (
    <div>
      <ProjectDetailsPage orgId={params.orgId} projectId={params.projectId} />
    </div>
  );
}

export default page;
