"use client";

import { Button, buttonVariants } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { PlusCircle, Clock, Check, X, Circle, AlertCircle } from "lucide-react";
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
import { useOrganizationMembers } from "../../hooks/use-organization-members";
import { cn, truncate } from "@/lib/utils";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { useCheckMembership } from "../../hooks/use-check-membership";
import { useAuth } from "@clerk/nextjs";
import { useWalletAuthContext } from "@/features/auth/lib/wallet-auth-context";

export function OrganizationProposals({
  organizationId,
}: {
  organizationId: string;
}) {
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

  const { data: membershipData, isLoading: isMembershipLoading } =
    useCheckMembership(organizationId);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="space-y-4 sm:space-y-6 pb-20">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Proposals
          </h2>
          {/* <p className="text-muted-foreground">
            Create and vote on funding proposals for your organization.
          </p> */}
        </div>
      </div>

      <div className="flex flex-col">
        {proposals?.activeProposals.length === 0 &&
        proposals?.pastProposals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 sm:py-12 text-center">
            <div className="rounded-full bg-muted p-3">
              <PlusCircle className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No proposals yet</h3>
            <p className="mt-2 text-sm text-muted-foreground px-4">
              Create a new proposal to get started
            </p>
            <Link
              href={`/organizations/${organizationId}/proposals/new`}
              className={cn(
                buttonVariants({ variant: "default" }),
                "mt-4 w-full sm:w-auto"
              )}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Proposal
            </Link>
          </div>
        ) : (
          <>
            <div className="flex flex-col w-full gap-2 mb-6 sm:mb-8">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                ACTIVE
              </p>
              {proposals?.activeProposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center border rounded-lg">
                  <div className="rounded-full bg-muted p-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    No active proposals
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground px-4">
                    Create a new proposal to get started
                  </p>
                  <Link
                    href={`/organizations/${organizationId}/proposals/new`}
                    className={cn(
                      buttonVariants({ variant: "default" }),
                      "mt-4 w-full sm:w-auto"
                    )}
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
                    membershipData={membershipData}
                    isActive={true}
                    organizationId={organizationId}
                  />
                ))
              )}
            </div>

            <div className="flex flex-col w-full gap-2">
              <p className="text-xs sm:text-sm text-muted-foreground font-medium">
                PAST
              </p>
              {proposals?.pastProposals.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-6 sm:py-8 text-center border rounded-lg">
                  <div className="rounded-full bg-muted p-3">
                    <Clock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <h3 className="mt-4 text-lg font-semibold">
                    No past proposals
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground px-4">
                    Past proposals will appear here once voting is complete
                  </p>
                </div>
              ) : (
                proposals?.pastProposals.map((proposal) => (
                  <ProposalCard
                    key={proposal.id}
                    proposal={proposal}
                    membershipData={membershipData}
                    isActive={false}
                    organizationId={organizationId}
                  />
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

interface MembershipType {
  isMember: boolean;
}

interface ProposalCardProps {
  proposal: ProposalType;
  isActive: boolean;
  membershipData: MembershipType;
  organizationId: string;
}

function ProposalCard({
  proposal,
  isActive,
  membershipData,
  organizationId,
}: ProposalCardProps) {
  const queryClient = useQueryClient();
  const { publicKey } = useWallet();
  const { userId } = useAuth();
  const { handleSignIn } = useWalletAuthContext();
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
      if (!userId) {
        await handleSignIn();
      }
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

      queryClient.invalidateQueries({
        queryKey: ["project_tasks"],
      });

      queryClient.invalidateQueries({
        queryKey: ["organization", organizationId],
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
      <CardHeader className="p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
          <div className="flex-1 min-w-0">
            <CardTitle className="text-base sm:text-lg font-medium break-words max-w-xs md:max-w-full">
              <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                <ProposalStatusBadge status={proposal.status} />
                <span className="truncate">{proposal.title || "Untitled"}</span>
              </div>
            </CardTitle>
            <CardDescription className="mt-2 text-xs sm:text-sm break-words">
              <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
                <span>Proposed by {truncate(proposal.proposer, 6, 3)}</span>
                {isActive && !hasVoted && (
                  <span className="text-muted-foreground">
                    <span className="hidden sm:inline"> | </span>
                    <DateComponent
                      datetime={dayjs.unix(proposal.expiresAt).toISOString()}
                      type="toDate"
                    />{" "}
                    left to vote
                  </span>
                )}
                <span className="text-muted-foreground">
                  <span className="hidden sm:inline"> | </span>
                  ADD {proposal.type}
                </span>
              </div>
            </CardDescription>
          </div>

          {/* Voting buttons - responsive layout */}
          {!!publicKey && isActive && (
            <div className="flex gap-2 w-full sm:w-auto justify-end">
              {!hasVoted && membershipData?.isMember ? (
                // Show voting buttons for eligible members
                <>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={transactionStatus.isProcessing}
                    className="text-white font-medium bg-[#2e9668] hover:bg-[#3ab981] dark:text-green-400 dark:border-green-900 dark:hover:bg-green-950 dark:hover:text-green-300 flex-1 sm:flex-none"
                    onClick={() => handleVote(true)}
                  >
                    YES
                  </Button>
                  <Button
                    variant="default"
                    size="sm"
                    disabled={transactionStatus.isProcessing}
                    onClick={() => handleVote(false)}
                    className="text-white font-medium bg-[#e11c48] hover:bg-[#f43f5e] border-red-200 dark:text-red-400 dark:border-red-900 dark:hover:bg-red-950 dark:hover:text-red-300 flex-1 sm:flex-none"
                  >
                    NO
                  </Button>
                </>
              ) : hasVoted ? (
                // Show voted status
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <Check className="h-4 w-4" />
                  <span>You voted</span>
                </div>
              ) : !membershipData?.isMember ? (
                // Show membership requirement for non-members
                <div className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground">
                  <AlertCircle className="h-4 w-4" />
                  <span className="hidden sm:inline">Members only</span>
                  <span className="sm:hidden">Members only</span>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </CardHeader>

      {isActive && (
        <CardContent className="px-3 sm:px-4">
          {/* <p className="text-sm mb-4">{proposal.description}</p> */}

          <>
            <div className="space-y-2 mt-2">
              {isActive && (
                <div className="flex flex-col sm:flex-row sm:justify-between text-xs text-muted-foreground gap-2 sm:gap-4">
                  <div className="flex">
                    <span className="flex items-center gap-1">
                      {proposal.type == "TASK" && (
                        <div className="flex items-center opacity-85 gap-1 text-xs">
                          <span className="hidden sm:inline">Results in</span>
                          <span className="sm:hidden">Reward:</span>
                          <Icons.usdc className="size-3" />{" "}
                          {(proposal.amount / 10 ** 6).toFixed(2)}
                          <span className="hidden sm:inline">
                            reward after completion
                          </span>
                        </div>
                      )}
                    </span>
                  </div>
                  <div className="flex gap-3 sm:gap-2">
                    <span className="flex items-center gap-1">
                      <span className="font-medium">{proposal.votesFor}</span>{" "}
                      YES
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="font-medium">
                        {proposal.votesAgainst}
                      </span>{" "}
                      NO
                    </span>
                    {/* <span>{remainingVotes} Members Haven&apos;t Voted</span> */}
                  </div>
                </div>
              )}
              <div className="relative h-2 bg-secondary rounded-full overflow-hidden hidden">
                <div
                  className="absolute h-full bg-stone-500 transition-all duration-300"
                  style={{
                    width: `${approvalPercentage + disapprovalPercentage}%`,
                  }}
                />
              </div>
            </div>
          </>
        </CardContent>
      )}
    </Card>
  );
}

function ProposalStatusBadge({ status }: { status: string }) {
  let className =
    "px-1 py-0.5 text-sm sm:text-base font-medium rounded-sm inline-flex items-center gap-1 w-fit ";
  let statusIcon;

  switch (status) {
    case "active":
      statusIcon = <Circle className="size-2 animate-ping fill-stone-500" />;
      className +=
        "bg-stone-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "approved":
      statusIcon = <Check className="size-3 sm:size-4" />;
      className +=
        "px-2 sm:px-2.5 bg-[#2e9668] text-white dark:bg-green-900/30 dark:text-green-400";
      break;
    case "rejected":
      statusIcon = <X className="size-3 sm:size-4" />;
      className +=
        "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusText = status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <span className={className}>{statusIcon ? statusIcon : statusText}</span>
  );
}
