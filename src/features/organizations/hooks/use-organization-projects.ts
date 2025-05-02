import { useQuery } from "@tanstack/react-query";
import { getOrganizationProjects } from "../actions/projects/get-organization-projects";

export function useOrganizationProjects(
  organizationId: string,
  status: string
) {
  return useQuery({
    queryKey: ["organization_projects", organizationId],
    queryFn: async () => {
      const projects = await getOrganizationProjects(
        organizationId,
        1,
        "active"
      );
      if (projects.error) throw new Error(projects.error.message);
      return projects.success;
    },
  });
}
