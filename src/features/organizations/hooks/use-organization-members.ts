import { useQuery } from "@tanstack/react-query";
import { getOrganizationMembers } from "../actions/members/get-organization-members";
import { Member } from "@/types/types.organization";
export function useOrganizationMembers(organizationId: string) {
  return useQuery({
    queryKey: ["organization_members", organizationId],
    queryFn: async () => {
      const members = await getOrganizationMembers(organizationId);
      if (members.error) throw new Error(members.error.message);
      return members.success as Member[];
    },
  });
}
