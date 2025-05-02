"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { ContributorVotesResponse } from "../actions/members/get-contributor-votes";

interface ContributorVoteCardProps {
  organizationId: string;
  memberId: string;
  memberName: string;
  voteData: ContributorVotesResponse | null;
  isLoading: boolean;
  onOpenVoteModal: (
    memberId: string,
    memberName: string,
    voteData: ContributorVotesResponse
  ) => void;
}

export function ContributorVoteCard({
  memberId,
  memberName,
  voteData,
  isLoading,
  onOpenVoteModal,
}: ContributorVoteCardProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border px-3 py-2 text-sm animate-pulse bg-secondary/20">
        Loading...
      </div>
    );
  }

  if (!voteData) {
    return (
      <div className="rounded-md border px-3 py-2 text-sm text-muted-foreground">
        Error
      </div>
    );
  }

  const { hasVoted, userVote, hasMetThreshold } = voteData;

  return (
    <Button
      variant="outline"
      size="sm"
      className={cn(
        "text-sm font-medium transition-all duration-200",
        hasVoted
          ? userVote
            ? "border-green-500 text-green-700 hover:bg-green-50"
            : "border-red-500 text-red-700 hover:bg-red-50"
          : "border-blue-500 text-blue-700 hover:bg-blue-50",
        hasMetThreshold && "ring-1 ring-green-500"
      )}
      onClick={() => onOpenVoteModal(memberId, memberName, voteData)}
    >
      {hasVoted ? (
        <div className="flex items-center gap-1">
          <span>VOTED</span>
          {userVote ? (
            <ThumbsUp className="h-3 w-3 ml-1" />
          ) : (
            <ThumbsDown className="h-3 w-3 ml-1" />
          )}
        </div>
      ) : (
        <span>VOTE</span>
      )}
    </Button>
  );
}
