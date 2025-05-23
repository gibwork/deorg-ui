import { useQuery } from "@tanstack/react-query";
import { Organization } from "@/types/types.organization";
import { getMemberOrganizations } from "../actions/members/get-member-organizations";
import { useWallet } from "@solana/wallet-adapter-react";

export function useMemberOrganizations() {
  const { publicKey } = useWallet();
  return useQuery({
    queryKey: ["member_organizations", publicKey],
    queryFn: async () => {
      const organization = await getMemberOrganizations(
        publicKey?.toString() ?? ""
      );
      if (organization.error) throw new Error(organization.error.message);
      return organization.success as Organization[];
    },
    enabled: !!publicKey,
  });
}
