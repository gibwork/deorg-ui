import { Button } from "@/components/ui/button";
import { joinOrganization } from "../actions/join-organization";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoaderButton } from "@/components/loader-button";
import { useWalletAuthContext } from "@/features/auth/lib/wallet-auth-context";
import { useAuth } from "@clerk/nextjs";
import { useCheckMembership } from "../hooks/use-check-membership";

export const FollowOrganizationButton = ({
  organizationId,
}: {
  organizationId: string;
}) => {
  const { data: membershipData, isLoading: isMembershipLoading } =
    useCheckMembership(organizationId);
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { handleSignIn } = useWalletAuthContext();
  const { publicKey } = useWallet();

  const joinOrgMutation = useMutation({
    mutationFn: joinOrganization,
    onSuccess: async (data) => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: ["organization", organizationId],
        }),
        queryClient.invalidateQueries({
          queryKey: ["member_organizations"],
        }),
        queryClient.invalidateQueries({
          queryKey: [
            "organization_membership",
            organizationId,
            publicKey?.toString(),
          ],
        }),
      ]);
    },
    onError: (error) => {
      // Revert the following state on error
      toast.error(error.message || "Failed to join organization");
    },
  });

  const handleJoin = async () => {
    if (!userId) {
      await handleSignIn();
    }

    joinOrgMutation.mutate(organizationId);
  };

  return (
    <LoaderButton
      variant={`${membershipData?.isMember ? "outline" : "default"}`}
      size={"sm"}
      disabled={joinOrgMutation.isPending || membershipData?.isMember}
      onClick={handleJoin}
      isLoading={joinOrgMutation.isPending}
    >
      <span className="font-mono">
        {membershipData?.isMember ? "Following" : "Follow"}
      </span>
    </LoaderButton>
  );
};
