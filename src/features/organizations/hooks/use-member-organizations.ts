import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { getMemberOrganizations } from "../actions/members/get-member-organizations";

export function useMemberOrganizations() {
  return useQuery({
    queryKey: ["member_organizations"],
    queryFn: async () => {
      const organization = await getMemberOrganizations();
      if (organization.error) throw new Error("organization.error");
      return organization.success as Organization[];
    },
  });
}
