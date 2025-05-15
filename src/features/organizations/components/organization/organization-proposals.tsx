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
import {
  PlusCircle,
  ThumbsDown,
  ThumbsUp,
  Clock,
  ExternalLink,
  CheckCircle,
  Check,
  ThumbsUpIcon,
  X,
  Loader2,
  Circle,
} from "lucide-react";
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
import { cn, truncate } from "@/lib/utils";
import Link from "next/link";
import { Icons } from "@/components/icons";
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
    <div className="space-y-6 pb-20">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Proposals</h2>
          {/* <p className="text-muted-foreground">
            Create and vote on funding proposals for your organization.
          </p> */}
        </div>
      </div>

      <div className="flex flex-col">
        <div className="flex flex-col w-full gap-2 mb-8">
          <p className="text-muted-foreground">ACTIVE</p>
          {proposals?.activeProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              isActive={true}
              organizationId={organizationId}
            />
          ))}
        </div>

        <div className="flex flex-col w-full gap-2">
          <p className="text-muted-foreground">PAST</p>
          {proposals?.pastProposals.map((proposal) => (
            <ProposalCard
              key={proposal.id}
              proposal={proposal}
              isActive={false}
              organizationId={organizationId}
            />
          ))}
        </div>
      </div>

      {/* <Tabs defaultValue="active" className="w-full">
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
      </Tabs> */}

      <CreateProposalModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSubmit={(data) => {
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
  const { publicKey } = useWallet();

  const { data: organizationMembers } = useOrganizationMembers(organizationId);
  const totalMembers =
    organizationMembers?.filter((member) => member.role === "CONTRIBUTOR")
      .length || 0;

  // Check if user has already voted
  const hasVoted = publicKey && proposal.voters?.includes(publicKey.toString());

  // Calculate percentages based on total members
  const totalVotesCast = proposal.votesTotal;
  const approvalPercentage =
    totalMembers > 0 ? Math.round((proposal.votesFor / totalMembers) * 100) : 0;
  const disapprovalPercentage =
    totalMembers > 0
      ? Math.round((proposal.votesAgainst / totalMembers) * 100)
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

      // console.log({
      //   proposalId: proposal,
      //   organizationId,
      //   transactionId: createProposalTx.transactionId,
      //   serializedTransaction: serializedSignedTransaction,
      // });

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
      <CardHeader className="p-3">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg font-medium whitespace-nowrap truncate ... w-[550px]">
              <ProposalStatusBadge status={proposal.status} />{" "}
              {proposal.title || "Untitled"}
            </CardTitle>
            <CardDescription className="mt-1">
              Proposed by {truncate(proposal.proposer, 8, 4)} {isActive && !hasVoted && (
                <span className="text-muted-foreground"> | {" "}
                  <DateComponent
                    datetime={dayjs.unix(proposal.expiresAt).toISOString()}
                    type="toDate"
                  /> left to vote
                </span>
              )} | ADD {proposal.type}
            </CardDescription>
          </div>
          {/* <ProposalStatusBadge status={proposal.status} /> */}
          {/* <Link
            href={`https://explorer.solana.com/address/${proposal.accountAddress}?cluster=devnet`}
            className="text-muted-foreground hover:text-primary ml-2"
          >
            <ExternalLink className="size-4" />
          </Link> */}
          {isActive && !hasVoted && (
            <div className="flex gap-2">
              <Button
                variant="default"
                size="sm"
                disabled={transactionStatus.isProcessing}
                className="text-white font-medium bg-[#2e9668] hover:bg-[#3ab981] dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950 dark:hover:text-green-300"
                onClick={() => handleVote(true)}
              >
                YES
                {/* Vote For */}
              </Button>
              <Button
                variant="default"
                size="sm"
                disabled={transactionStatus.isProcessing}
                onClick={() => handleVote(false)}
                className="text-white font-medium bg-[#e11c48] hover:bg-[#f43f5e] border-red-200 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300"
              >
                NO
                {/* Vote Against */}
              </Button>
            </div>
          )}
        </div>
      </CardHeader>

      {isActive && (
        <CardContent className="px-3">
          {/* <p className="text-sm mb-4">{proposal.description}</p> */}

          <>
            <div className="space-y-2 mt-2">
              {isActive && (
                <div className="flex justify-between text-xs text-muted-foreground gap-4">
                  <div className="flex">
                    <span className="flex items-center gap-1">
                      {proposal.type == "TASK" && (
                        <div className="flex items-center opacity-85 gap-1">
                          Results in <Icons.usdc className="size-3" />{" "}
                          {(proposal.amount / 10 ** 6).toFixed(2)} reward after completion
                        </div>
                      )}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="flex items-center gap-1 me-2">
                      {proposal.votesFor} YES
                    </span>
                    <span className="flex items-center gap-1">
                      {proposal.votesAgainst} NO
                    </span>
                    {/* <span>{remainingVotes} Members Haven&apos;t Voted</span> */}
                  </div>
                </div>
              )}
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden">
                <div
                  className="absolute h-full bg-stone-500 transition-all duration-300"
                  style={{ width: `${approvalPercentage + disapprovalPercentage}%` }}
                />
                {/* <div
                  className="absolute h-full bg-stone-50 transition-all duration-300"
                  style={{
                    width: `${disapprovalPercentage}%`,
                    left: `${approvalPercentage}%`,
                  }}
                /> */}
              </div>
            </div>
          </>
        </CardContent>
      )}

      {/* {isActive && !hasVoted && (
        <CardFooter className="flex  justify-between">
          <div className="mt-4 p-3 bg-amber-50 text-amber-800 rounded-md text-sm dark:bg-amber-900/20 dark:text-amber-400">
            <span className="font-medium">Time remaining:</span>{" "}
            <DateComponent
              datetime={dayjs.unix(proposal.expiresAt).toISOString()}
              type="toDate"
            />
            {proposal.expiresAt &&
                `${dayjs
                  .unix(proposal.expiresAt)
                  .format("MMM D, YYYY h:mm A")}`}
          </div>


        </CardFooter>
      )} */}
    </Card>
  );
}

function ProposalStatusBadge({ status }: { status: string }) {
  let className = "px-2.5 py-0.5 text-lg font-medium rounded-sm ";
  let statusIcon;

  switch (status) {
    case "active":
      statusIcon = <Circle className="size-2 inline-block animate-ping fill-stone-500" />;
      className +=
        "bg-stone-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "approved":
      statusIcon = <Check className="size-4 inline-block" />;
      className +=
        "bg-[#2e9668] !px-4 align-middle text-white dark:bg-green-900/30 dark:text-green-400";
      break;
    case "rejected":
      statusIcon = <X className="size-4 inline-block" />;
      className +=
        "bg-red-100 !px-4 align-middle text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={className + " mr-2"}>
      {statusIcon ? statusIcon : statusText}
    </span>
  );
}
