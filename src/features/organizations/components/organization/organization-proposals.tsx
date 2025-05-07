"use client";

import { useState } from "react";
import { Button, buttonVariants } from "@/components/ui/button";
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
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getOrganizationProposals,
  ProposalType,
} from "../../actions/proposals/get-organization-proposals";
import { createProposalVote } from "../../actions/proposals/create-proposal-vote";
import { toast } from "sonner";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { voteProposal } from "../../actions/proposals/vote-proposal";
import dayjs from "dayjs";
import DateComponent from "@/components/date-component";
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { LoaderButton } from "@/components/loader-button";
import { useOrganizationMembers } from "../../hooks/use-organization-members";
import { cn } from "@/lib/utils";
import Link from "next/link";
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
        <Link
          href={`/organizations/${organizationId}/proposals/new`}
          className={cn(
            buttonVariants({ variant: "default" }),
            "flex items-center"
          )}
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          Create Proposal
        </Link>
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
              <Link
                href={`/organizations/${organizationId}/proposals/new`}
                className={cn(buttonVariants({ variant: "default" }), "mt-4")}
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Create Proposal
              </Link>
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
  const queryClient = useQueryClient();

  console.log(proposal);

  const { data: organizationMembers } = useOrganizationMembers(organizationId);
  const totalMembers =
    organizationMembers?.filter((member) => member.role === "CONTRIBUTOR")
      .length || 0;

  // Calculate percentages based on total votes cast
  const totalVotesCast = proposal.votesTotal;
  const approvalPercentage =
    totalVotesCast > 0
      ? Math.round((proposal.votesFor / totalVotesCast) * 100)
      : 0;
  const disapprovalPercentage =
    totalVotesCast > 0
      ? Math.round((proposal.votesAgainst / totalVotesCast) * 100)
      : 0;
  const remainingVotes = totalMembers - totalVotesCast;

  const { signTransaction } = useWallet();

  const transactionStatus = useTransactionStatus();

  const {
    startTransaction,
    updateStep,
    setTxHash,
    updateStatus,
    addWarning,
    resetTransaction,
  } = useTransactionStore.getState();

  const handleVote = async (vote: boolean) => {
    if (!signTransaction) {
      toast.error("No wallet connected");
      return;
    }

    try {
      transactionStatus.onStart();
      toast.dismiss();
      const transactionId = startTransaction(
        `Vote ${vote ? "For" : "Against"} `
      );

      updateStep(1, "loading", "Preparing transaction details...");

      const { success: createProposalTx, error } = await createProposalVote(
        proposal.proposalAddress,
        vote,
        organizationId
      );
      if (error || !createProposalTx) {
        throw new Error(error);
      }

      updateStep(1, "success");
      updateStep(2, "loading", "Please sign the transaction in your wallet");

      const transaction = Transaction.from(
        Buffer.from(createProposalTx?.serializedTransaction, "base64")
      );

      const signedTransaction = await signTransaction(transaction);
      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const serializedSignedTransaction = signedTransaction
        ?.serialize()
        .toString("base64");

      console.log({
        proposalId: proposal,
        organizationId,
        transactionId: createProposalTx.transactionId,
        serializedTransaction: serializedSignedTransaction,
      });

      const voteResponse = await voteProposal(
        proposal.proposalAddress,
        organizationId,
        createProposalTx.transactionId,
        serializedSignedTransaction
      );

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (voteResponse.error) {
        throw new Error(voteResponse.error);
      }

      queryClient.invalidateQueries({
        queryKey: ["organization_proposals", organizationId],
      });

      updateStep(4, "success");
      updateStatus("success");
    } catch (error) {
      console.error(error);
      const errorMessage =
        error instanceof Error ? error.message : "Please try again later";

      // Find the current step that failed
      const currentStep =
        [1, 2, 3, 4].find((step) => {
          const activeTransaction =
            useTransactionStore.getState().activeTransaction;
          return (
            activeTransaction?.steps.find((s) => s.id === step)?.status ===
            "loading"
          );
        }) || 2;

      // Update the failed step with error message
      updateStep(currentStep, "error", errorMessage);
      updateStatus("error");

      // Add warning if it's a specific type of error
      if (error instanceof Error && error.message.includes("insufficient")) {
        addWarning("Insufficient balance for transaction");
      }
    } finally {
      transactionStatus.onEnd();
    }
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
        {/* <p className="text-sm mb-4">{proposal.description}</p> */}

        {proposal.requestedAmount && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Requested Amount</span>
            <span className="font-bold">
              {proposal.requestedAmount?.amount} SOL
            </span>
          </div>
        )}

        {proposal.proposedRate && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium">Proposed Rate</span>
            <span className="font-bold">{proposal.proposedRate} SOL</span>
          </div>
        )}

        {isActive && (
          <>
            <div className="space-y-2 mt-4">
              <div className="flex justify-between text-sm">
                <span>Voting Progress</span>
                <span>{approvalPercentage}% Approval</span>
              </div>
              <Progress
                value={approvalPercentage}
                className="h-2 bg-secondary"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{proposal.votesFor} For</span>
                <span>{proposal.votesAgainst} Against</span>
                <span>{remainingVotes} Members Haven&apos;t Voted</span>
              </div>
            </div>
          </>
        )}
      </CardContent>

      {isActive && (
        <CardFooter className="flex  justify-between">
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md text-sm dark:bg-amber-900/20 dark:text-amber-400">
            <span className="font-medium">Time remaining:</span>{" "}
            <DateComponent
              datetime={dayjs.unix(proposal.expiresAt).toISOString()}
              type="toDate"
            />
            {/* {proposal.expiresAt &&
                `${dayjs
                  .unix(proposal.expiresAt)
                  .format("MMM D, YYYY h:mm A")}`} */}
          </div>

          {isActive && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={transactionStatus.isProcessing}
                onClick={() => handleVote(false)}
                className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300"
              >
                <ThumbsDown className="mr-2 h-4 w-4" />
                Vote Against
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={transactionStatus.isProcessing}
                className="text-green-600 border-green-200 hover:bg-green-50 hover:text-green-700 dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950 dark:hover:text-green-300"
                onClick={() => handleVote(true)}
              >
                <ThumbsUp className="mr-2 h-4 w-4" />
                Vote For
              </Button>
            </div>
          )}
        </CardFooter>
      )}
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
