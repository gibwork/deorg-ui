import { useQuery } from "@tanstack/react-query";
import { checkMembership } from "../actions/members/check-membership";
import { useWallet } from "@solana/wallet-adapter-react";

export function useCheckMembership(
  organizationId: string,
  options?: { enabled: boolean }
) {
  const { publicKey } = useWallet();
  return useQuery({
    queryKey: [
      "organization_membership",
      organizationId,
      publicKey?.toString(),
    ],
    queryFn: async () => {
      const result = await checkMembership(
        organizationId,
        publicKey?.toString() ?? ""
      );
      if (result.error) throw new Error(result.error.message);
      return result.success;
    },
    enabled: !!publicKey,
  });
}
