"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Textarea } from "@/components/ui/textarea"
import { ThumbsDown, ThumbsUp } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface VotingSystemProps {
  entityType: "project" | "proposal" | "task" | "role_change" | "contributor_application"
  entityId: number
  entityTitle: string
  votingStatus: {
    status: "voting" | "approved" | "rejected"
    votesFor: number
    votesAgainst: number
    totalVotes: number
    endTime?: string
  }
  votes: Array<{
    voter: {
      name: string
      avatar: string
    }
    vote: "for" | "against"
    timestamp: string
    comment?: string
  }>
  onVote?: (vote: "for" | "against", comment: string) => void
}

export function VotingSystem({ entityType, entityId, entityTitle, votingStatus, votes, onVote }: VotingSystemProps) {
  const [comment, setComment] = useState("")
  const [isVoting, setIsVoting] = useState(false)
  const [voteType, setVoteType] = useState<"for" | "against" | null>(null)

  const handleVote = async (type: "for" | "against") => {
    setVoteType(type)
    setIsVoting(true)
  }

  const submitVote = async () => {
    if (!voteType) return

    try {
      // This is where you would connect to your API/blockchain
      if (onVote) {
        onVote(voteType, comment)
      }

      // Reset state
      setComment("")
      setIsVoting(false)
      setVoteType(null)
    } catch (error) {
      console.error("Error submitting vote:", error)
    }
  }

  const cancelVote = () => {
    setComment("")
    setIsVoting(false)
    setVoteType(null)
  }

  const getEntityTypeLabel = () => {
    switch (entityType) {
      case "project":
        return "Project"
      case "proposal":
        return "Proposal"
      case "task":
        return "Task"
      case "role_change":
        return "Role Change"
      case "contributor_application":
        return "Contributor Application"
      default:
        return "Item"
    }
  }

  const votePercentage = Math.round((votingStatus.votesFor / votingStatus.totalVotes) * 100) || 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>Voting on {getEntityTypeLabel()}</CardTitle>
        <CardDescription>
          {votingStatus.status === "voting"
            ? `Voting in progress for "${entityTitle}"`
            : votingStatus.status === "approved"
              ? `"${entityTitle}" has been approved`
              : `"${entityTitle}" has been rejected`}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Current Status</span>
            <Badge
              variant="outline"
              className={`
                ${votingStatus.status === "voting" ? "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400" : ""}
                ${votingStatus.status === "approved" ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400" : ""}
                ${votingStatus.status === "rejected" ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400" : ""}
              `}
            >
              {votingStatus.status.charAt(0).toUpperCase() + votingStatus.status.slice(1)}
            </Badge>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Approval Rate</span>
              <span>{votePercentage}%</span>
            </div>
            <Progress value={votePercentage} className="h-2" />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>{votingStatus.votesFor} For</span>
              <span>{votingStatus.votesAgainst} Against</span>
              <span>{votingStatus.totalVotes - votingStatus.votesFor - votingStatus.votesAgainst} Remaining</span>
            </div>
          </div>

          {votingStatus.endTime && votingStatus.status === "voting" && (
            <div className="mt-2 p-3 bg-amber-50 text-amber-800 rounded-md text-sm dark:bg-amber-900/20 dark:text-amber-400">
              Voting ends: {votingStatus.endTime}
            </div>
          )}
        </div>

        {isVoting ? (
          <div className="space-y-4 pt-2">
            <div className="p-3 bg-blue-50 text-blue-800 rounded-md text-sm dark:bg-blue-900/20 dark:text-blue-400">
              You are voting <strong>{voteType === "for" ? "FOR" : "AGAINST"}</strong> this{" "}
              {getEntityTypeLabel().toLowerCase()}
            </div>
            <div className="space-y-2">
              <Textarea
                placeholder="Add a comment explaining your vote (optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelVote} className="w-1/2">
                Cancel
              </Button>
              <Button onClick={submitVote} className="w-1/2">
                Submit Vote
              </Button>
            </div>
          </div>
        ) : (
          votingStatus.status === "voting" && (
            <div className="flex gap-2 pt-2">
              <Button variant="outline" className="w-1/2" onClick={() => handleVote("against")}>
                <ThumbsDown className="mr-2 h-4 w-4" />
                Vote Against
              </Button>
              <Button className="w-1/2" onClick={() => handleVote("for")}>
                <ThumbsUp className="mr-2 h-4 w-4" />
                Vote For
              </Button>
            </div>
          )
        )}

        <div className="space-y-4 pt-4">
          <h4 className="text-sm font-medium">Recent Votes</h4>
          <div className="space-y-3">
            {votes.length > 0 ? (
              votes.slice(0, 3).map((vote, index) => (
                <div key={index} className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={vote.voter.avatar || "/placeholder.svg"} alt={vote.voter.name} />
                    <AvatarFallback>{vote.voter.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between items-center">
                      <p className="text-sm font-medium">{vote.voter.name}</p>
                      <Badge
                        variant="outline"
                        className={`
                          ${
                            vote.vote === "for"
                              ? "bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                              : "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800"
                          }
                        `}
                      >
                        {vote.vote === "for" ? "Voted For" : "Voted Against"}
                      </Badge>
                    </div>
                    {vote.comment && <p className="text-sm mt-1">{vote.comment}</p>}
                    <p className="text-xs text-muted-foreground mt-1">{vote.timestamp}</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No votes yet</p>
            )}
          </div>
        </div>
      </CardContent>
      <CardFooter>
        {votes.length > 3 && (
          <Button variant="link" className="px-0">
            View all {votes.length} votes
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}
