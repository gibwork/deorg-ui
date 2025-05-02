"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { PlusCircle, ThumbsDown, ThumbsUp, Clock } from "lucide-react";
import { CreateProposalModal } from "./create-proposal-modal";
import { useQuery } from "@tanstack/react-query";
import {
  getOrganizationProposals,
  ProposalType,
} from "../../actions/proposals/get-organization-proposals";
import { createProposalVote } from "../../actions/proposals/create-proposal-vote";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { voteProposal } from "../../actions/proposals/vote-proposal";

export function OrganizationProposals({
  organizationId,
}: {
  organizationId: string;
}) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  const {
    data: proposals,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["organization_proposals", organizationId],
    queryFn: async () => {
      const proposals = await getOrganizationProposals(
        organizationId,
        1,
        "active"
      );
      if (proposals.error) throw new Error(proposals.error.message);
      return proposals.success;
    },
  });

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proposals</h2>
          <p className="text-muted-foreground">
            Create and vote on funding proposals for your organization.
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <PlusCircle className="mr-2 h-4 w-4" />
          New Proposal
        </Button>
      </div>

      <Tabs defaultValue="active" className="w-full">
        <TabsList>
          <TabsTrigger value="active">
            Active ({proposals?.activeProposals.length})
          </TabsTrigger>
          <TabsTrigger value="past">
            Past ({proposals?.pastProposals.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="active" className="space-y-4 mt-6">
          {proposals?.activeProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <PlusCircle className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">
                No active proposals
              </h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Create a new proposal to get started
              </p>
              <Button onClick={() => setShowCreateModal(true)} className="mt-4">
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Proposal
              </Button>
            </div>
          ) : (
            proposals?.activeProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                isActive={true}
                organizationId={organizationId}
              />
            ))
          )}
        </TabsContent>

        <TabsContent value="past" className="space-y-4 mt-6">
          {proposals?.pastProposals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="rounded-full bg-muted p-3">
                <Clock className="h-6 w-6 text-muted-foreground" />
              </div>
              <h3 className="mt-4 text-lg font-semibold">No past proposals</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Past proposals will appear here once voting is complete
              </p>
            </div>
          ) : (
            proposals?.pastProposals.map((proposal) => (
              <ProposalCard
                key={proposal.id}
                proposal={proposal}
                isActive={false}
                organizationId={organizationId}
              />
            ))
          )}
        </TabsContent>
      </Tabs>

      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => {
          console.log("Creating proposal with data:", data);
          setShowCreateModal(false);
        }}
      />
    </div>
  );
}

interface ProposalCardProps {
  proposal: ProposalType;
  isActive: boolean;
  organizationId: string;
}

function ProposalCard({
  proposal,
  isActive,
  organizationId,
}: ProposalCardProps) {
  const votePercentage =
    Math.round((proposal.votesFor / proposal.votesTotal) * 100) || 0;
  const { signTransaction } = useWallet();

  const handleVote = async (vote: boolean) => {
    if (!signTransaction) {
      toast.error("No wallet connected");
      return;
    }

    const response = await createProposalVote(
      proposal.id,
      vote,
      organizationId
    );
    if (response.error) {
      toast.error(response.error);
      return;
    }

    if (!response.success) {
      toast.error("Failed to create proposal vote");
      return;
    }

    const transaction = Transaction.from(
      Buffer.from(response.success.serializedTransaction, "base64")
    );

    const signedTransaction = await signTransaction(transaction);
    if (!signedTransaction) {
      toast.error("Failed to sign transaction");
      return;
    }

    const serializedSignedTransaction = signedTransaction
      ?.serialize()
      .toString("base64");

    console.log({
      proposalId: proposal.id,
      organizationId,
      transactionId: response.success.transactionId,
      serializedTransaction: serializedSignedTransaction,
    });

    const voteResponse = await voteProposal(
      proposal.id,
      organizationId,
      response.success.transactionId,
      serializedSignedTransaction
    );

    if (voteResponse.error) {
      toast.error(voteResponse.error);
      return;
    }

    toast.success("Vote cast successfully");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle>{proposal.title || "Untitled"}</CardTitle>
            <CardDescription className="mt-1">
              <p className="text-sm mb-4">{proposal.proposalAddress}</p>
              Proposed by {proposal.proposer}
            </CardDescription>
          </div>
          <ProposalStatusBadge status={proposal.status} />
        </div>
      </CardHeader>

      <CardContent>
        <p className="text-sm mb-4">{proposal.description}</p>

        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium">Requested Amount</span>
          <span className="font-bold">
            {proposal.requestedAmount?.amount} SOL
          </span>
        </div>

        {isActive && (
          <>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Voting Progress</span>
                <span>{votePercentage}% Approval</span>
              </div>
              <Progress value={votePercentage} className="h-2" />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{proposal.votesFor} For</span>
                <span>{proposal.votesAgainst} Against</span>
                <span>
                  {proposal.votesTotal -
                    proposal.votesFor -
                    proposal.votesAgainst}{" "}
                  Remaining
                </span>
              </div>
            </div>

            <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md text-sm dark:bg-amber-900/20 dark:text-amber-400">
              <span className="font-medium">Time remaining:</span>{" "}
              {proposal.deadline && `${proposal.deadline} days left to vote`}
            </div>
          </>
        )}
      </CardContent>

      <CardFooter className="flex justify-between">
        <Button variant="outline" size="sm">
          View Details
        </Button>

        {isActive && (
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300"
            >
              <ThumbsDown className="mr-2 h-4 w-4" />
              Vote Against
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950 dark:hover:text-green-300"
              onClick={() => handleVote(true)}
            >
              <ThumbsUp className="mr-2 h-4 w-4" />
              Vote For
            </Button>
          </div>
        )}
      </CardFooter>
    </Card>
  );
}

function ProposalStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-xs font-medium rounded-full ";

  switch (status) {
    case "voting":
      className +=
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "approved":
      className +=
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "rejected":
      className +=
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return <span className={className}>{statusText}</span>;
}
