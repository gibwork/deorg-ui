import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { getMemberOrganizations } from "../actions/members/get-member-organizations";
import { useAuth } from "@clerk/nextjs";

export function useMemberOrganizations() {
  const { userId } = useAuth();
  return useQuery({
    queryKey: ["member_organizations", userId],
    queryFn: async () => {
      const organization = await getMemberOrganizations();
      if (organization.error) throw new Error(organization.error.message);
      return organization.success as Organization[];
    },
    enabled: !!userId,
  });
}
