"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";

import { ProjectDetailModal } from "./project-detail-modal";
import { useOrganization } from "../../hooks/use-organization";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey, Transaction } from "@solana/web3.js";
import {
  createTransferInstruction,
  getAssociatedTokenAddress,
} from "@solana/spl-token";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Organization } from "@/types/types.organization";
import { OrganizationProposals } from "./organization-proposals";

import Image from "next/image";
import { useCheckMembership } from "../../hooks/use-check-membership";
import { useAuth } from "@clerk/nextjs";
import { FollowOrganizationButton } from "../follow-organization-button";

export function OrganizationOverview({
  organizationId,
}: {
  organizationId: string;
}) {
  const [selectedProject, setSelectedProject] = useState<any | null>(null);
  const [showProjectDetail, setShowProjectDetail] = useState(false);
  const [showDepositModal, setShowDepositModal] = useState(false);
  const { userId } = useAuth();

  const {
    data: organization,
    isLoading,
    error,
  } = useOrganization(organizationId);

  const { data: membershipData, isLoading: isMembershipLoading } =
    useCheckMembership(organizationId, { enabled: !!userId });

  if (error) {
    return (
      <div className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            Failed to load organization details. Please try again later.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  console.log(organization);

  if (organization)
    return (
      <div className="space-y-6 pb-20">
        {/* header */}

        <div className="bg-white dark:bg-gray-950 rounded-lg border p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex w-full gap-3">
              <div className="h-20 w-20">
                <Image
                  src={
                    organization?.metadata?.logoUrl ??
                    organization.token?.imageUrl!
                  }
                  alt={organization?.name}
                  width={100}
                  height={100}
                  className="rounded-lg "
                />
              </div>

              <div className="flex flex-col  w-full">
                <h1 className="text-2xl font-bold">{organization?.name}</h1>

                <div className="flex flex-row items-center gap-3 text-sm text-stone-500">
                  <span className="flex items-center gap-1">
                    {organization.contributors?.length || 0} contributors
                  </span>
                  •
                  <span className="flex items-center gap-1">
                    {organization.members?.length || 0} Followers
                  </span>
                </div>
              </div>

              {!isMembershipLoading ? (
                <div className="inline-flex justify-end ">
                  <FollowOrganizationButton
                    organizationId={organizationId}
                    isFollowing={membershipData?.isMember}
                  />
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>

        <OrganizationProposals organizationId={organizationId} />

        {/* <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Activity</CardTitle>
              <Button variant="ghost" size="sm">
                View All
              </Button>
            </div>
            <CardDescription>
              Recent actions in your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {organizationOverview?.recentActivity.map((activity, i) => (
                <div key={i} className="flex items-start gap-4">
                  <div className="rounded-full p-2 bg-muted">
                    {activity.type === "proposal" && (
                      <FileText className="h-4 w-4" />
                    )}
                    {activity.type === "task" && (
                      <ListChecks className="h-4 w-4" />
                    )}
                    {activity.type === "member" && (
                      <Users className="h-4 w-4" />
                    )}
                    {activity.type === "transaction" && (
                      <BarChart3 className="h-4 w-4" />
                    )}
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{activity.title}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="mr-1 h-3 w-3" />
                      {activity.time}
                    </div>
                  </div>
                  <div className="ml-auto">
                    <Badge status={activity.status} />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Quick Actions</CardTitle>
            </div>
            <CardDescription>
              Common tasks for organization management
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>New Proposal</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a proposal
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  <span>New Task</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Create a task for contributors
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <Users className="h-4 w-4 mr-2" />
                  <span>Manage Roles</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Update member permissions
                </p>
              </Button>

              <Button
                variant="outline"
                className="h-auto flex-col items-start p-4 justify-start text-left"
              >
                <div className="flex items-center w-full">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  <span>Treasury</span>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Manage organization funds
                </p>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div> */}

        {selectedProject && (
          <ProjectDetailModal
            isOpen={showProjectDetail}
            onClose={() => setShowProjectDetail(false)}
            project={selectedProject}
          />
        )}

        {showDepositModal && (
          <DepositModal
            isOpen={showDepositModal}
            onClose={() => setShowDepositModal(false)}
            organization={organization!}
          />
        )}
      </div>
    );
}

function DepositModal({
  isOpen,
  onClose,
  organization,
}: {
  isOpen: boolean;
  onClose: () => void;
  organization: Organization;
}) {
  const [amount, setAmount] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { publicKey, signTransaction } = useWallet();
  const { connection } = useConnection();

  const handleDeposit = async () => {
    if (!publicKey || !amount || !organization) return;

    try {
      setIsLoading(true);
      setError(null);

      // Get the latest blockhash
      const { blockhash } = await connection.getLatestBlockhash();

      // Get user's token account
      const userTokenAccount = await getAssociatedTokenAddress(
        new PublicKey(organization.tokenMint),
        publicKey
      );

      const treasuryTokenAccount = organization.treasuryBalances[0]!;

      // Convert amount to raw value using decimals
      const rawAmount = Math.floor(
        parseFloat(amount) * Math.pow(10, treasuryTokenAccount.decimals)
      );

      const transaction = new Transaction();
      transaction.recentBlockhash = blockhash;
      transaction.feePayer = publicKey;

      console.log({
        from: userTokenAccount.toBase58(), // from
        to: treasuryTokenAccount.tokenAccount, // to
        mint: organization.tokenMint, // mint
        amount: rawAmount,
      });

      // Add transfer instruction
      const transferInstruction = createTransferInstruction(
        userTokenAccount, // from
        new PublicKey(treasuryTokenAccount.tokenAccount), // to
        publicKey, // owner (signer)
        BigInt(rawAmount)
      );

      transaction.add(transferInstruction);

      // Send transaction
      if (!signTransaction) throw new Error("Wallet not connected");
      const signedTx = await signTransaction(transaction);
      const signature = await connection.sendRawTransaction(
        signedTx.serialize()
      );
      await connection.confirmTransaction(signature);

      onClose();
    } catch (error) {
      console.error("Error depositing:", error);
      setError(
        error instanceof Error ? error.message : "Failed to process deposit"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Deposit to Treasury</DialogTitle>
          <DialogDescription>
            Enter the amount you want to deposit to the organization treasury.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
            <p className="text-sm text-muted-foreground">
              Token: {organization?.token?.symbol}
            </p>
            {error && <p className="text-sm text-red-500 mt-2">{error}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button
            onClick={handleDeposit}
            disabled={isLoading || !amount || !publicKey}
          >
            {isLoading ? "Processing..." : "Deposit"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Helper component for activity status badges
function Badge({ status }: { status: string }) {
  let className = "px-2 py-1 text-xs rounded-full ";

  switch (status) {
    case "APPROVED":
      className +=
        "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
      break;
    case "COMPLETED":
      className +=
        "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
      break;
    case "NEW":
      className +=
        "bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400";
      break;
    default:
      className +=
        "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  return <span className={className}>{status}</span>;
}

function ProjectStatusBadge({
  status,
  votingStatus,
}: {
  status: string;
  votingStatus?: any;
}) {
  let className = "px-2 py-0.5 text-xs font-medium rounded-full ";

  if (status === "VOTING") {
    className +=
      "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400";
  } else if (status === "IN_PROGRESS") {
    className +=
      "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
  } else if (status === "COMPLETED") {
    className +=
      "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
  } else {
    className +=
      "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }

  const statusMap: Record<string, string> = {
    VOTING: "Voting",
    IN_PROGRESS: "In Progress",
    COMPLETED: "Completed",
  };

  return <span className={className}>{statusMap[status] || status}</span>;
}
