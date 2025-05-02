import { useQuery } from "@tanstack/react-query";
import { getOrganizationDetails } from "../actions/get-organization-details";
import { Organization } from "@/types/types.organization";

export function useOrganization(organizationId: string) {
  return useQuery({
    queryKey: ["organization", organizationId],
    queryFn: async () => {
      const organization = await getOrganizationDetails(organizationId);
      if (organization.error) throw new Error(organization.error);
      return organization.success as Organization;
    },
  });
}
