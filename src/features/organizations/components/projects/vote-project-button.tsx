import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { voteOnProject } from "../../actions/projects/vote-on-project";
import React, { useState } from "react";
import { toast } from "sonner";
import { useParams } from "next/navigation";
import { ConfirmationModal } from "@/features/tasks/components/confirmation-modal";

function VoteProjectButton({ project }: { project: any }) {
  const [isVoteModalOpen, setIsVoteModalOpen] = useState(false);

  const voteProjectMutation = useMutation({
    mutationFn: voteOnProject,
    onSuccess: (data) => {
      if (data.error) {
        toast.error(data.error.message || "Failed to vote on project", {
          position: "top-right",
        });
        return;
      }

      // Successfully voted
      toast.success("Project voted successfully");
    },
    onError: (error) => {
      console.error(error);
      toast.error("An unexpected error occurred while voting on project");
    },
  });

  const handleVote = (project: any) => {
    setIsVoteModalOpen(true);
  };

  const handleVoteConfirm = () => {
    voteProjectMutation.mutate({
      organizationId: project.organizationId,
      projectId: project.id,
      vote: true,
      comment: "",
    });
    setIsVoteModalOpen(false);
  };

  return (
    <>
      <Button variant="default" size="sm" onClick={() => handleVote(project)}>
        Vote Now
      </Button>

      <ConfirmationModal
        isOpen={isVoteModalOpen}
        onClose={setIsVoteModalOpen}
        onConfirm={handleVoteConfirm}
        variant="info"
        title="Confirm Your Vote"
        description={`Are you sure you want to vote for "${project?.name}"?`}
        items={[
          "Your vote cannot be changed once submitted.",
          "Voting will help determine if this project gets approved.",
          "Make sure you've reviewed the project details before voting.",
        ]}
        confirmText="Confirm Vote"
        cancelText="Cancel"
      />
    </>
  );
}

export default VoteProjectButton;
