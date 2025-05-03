import { useQuery } from "@tanstack/react-query";
import { checkMembership } from "../actions/members/check-membership";

export function useCheckMembership(
  organizationId: string,
  options?: { enabled: boolean }
) {
  return useQuery({
    queryKey: ["organization_membership", organizationId],
    queryFn: async () => {
      const result = await checkMembership(organizationId);
      if (result.error) throw new Error(result.error.message);
      return result.success;
    },
    retry: false,
    enabled: options?.enabled,
  });
}
