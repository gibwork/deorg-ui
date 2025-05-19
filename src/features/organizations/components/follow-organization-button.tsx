import { Button } from "@/components/ui/button";
import { joinOrganization } from "../actions/join-organization";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useState } from "react";

export const FollowOrganizationButton = ({
  organizationId,
  isFollowing: initialIsFollowing,
}: {
  organizationId: string;
  isFollowing: boolean;
}) => {
  const [isFollowing, setIsFollowing] = useState(initialIsFollowing);
  const queryClient = useQueryClient();

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
          queryKey: ["organization_membership", organizationId],
        }),
      ]);
    },
    onError: (error) => {
      // Revert the following state on error
      setIsFollowing(false);
      toast.error(error.message || "Failed to join organization");
    },
  });

  const handleJoin = async () => {
    // Optimistically updating the UI here
    setIsFollowing(true);

    joinOrgMutation.mutate(organizationId);
  };

  return (
    <Button
      variant={`${isFollowing ? "outline" : "default"}`}
      size={"sm"}
      disabled={joinOrgMutation.isPending || isFollowing}
      onClick={handleJoin}
    >
      <span className="font-mono">{isFollowing ? "Following" : "Follow"}</span>
    </Button>
  );
};
