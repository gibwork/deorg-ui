"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  MoreHorizontal,
  UserPlus,
  Users,
  Loader2,
  DollarSign,
  Clock,
} from "lucide-react";
import { truncate } from "@/lib/utils";
import DateComponent from "@/components/date-component";
import { Member } from "@/types/types.organization";
import { useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createContributorProposal } from "../../actions/members/create-proposal-contributor";
import { proposeContributorRequest } from "@/actions/post/propsose-contributor-request";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOrganizationMembers } from "../../hooks/use-organization-members";
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
export function OrganizationMembers({
  organizationId,
}: {
  organizationId: string;
}) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { user } = useUser();
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const { publicKey, signTransaction } = useWallet();
  const {
    startTransaction,
    updateStep,
    setTxHash,
    updateStatus,
    addWarning,
    resetTransaction,
  } = useTransactionStore.getState();
  const { data: members, isLoading } = useOrganizationMembers(organizationId);

  const currentUserRole = useMemo(() => {
    return members?.find((member) => member.user.externalId === user?.id)?.role;
  }, [members, user]);

  const handleRoleChange = (member: Member) => {
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const handleNominateAsContributor = async (member: Member) => {
    if (!publicKey || !signTransaction) return;
    try {
      toast.dismiss();
      const transactionId = startTransaction(
        `Nominate ${member.user.username} as contributor`
      );

      updateStep(1, "loading", "Preparing transaction details...");
      const { success, error } = await proposeContributorRequest(
        organizationId,
        member.user.walletAddress
      );
      if (error) {
        throw new Error(error);
      }

      updateStep(1, "success");
      updateStep(2, "loading", "Please sign the transaction in your wallet");

      const retreivedTx = Transaction.from(
        Buffer.from(success.serializedTransaction, "base64")
      );

      const serializedTx = await signTransaction(retreivedTx);

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const transactionResponse = await createContributorProposal({
        organizationId,
        transactionId: success.transactionId,
        serializedTransaction: serializedTx?.serialize().toString("base64"),
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (transactionResponse.error) {
        throw new Error(transactionResponse.error.message);
      }

      queryClient.invalidateQueries({
        queryKey: ["organization_members", organizationId],
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
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Organization Members</span>{" "}
              {/* <Button onClick={() => setShowInviteModal(true)}>
                <UserPlus className="mr-2 h-4 w-4" />
                Invite Member
              </Button> */}
            </CardTitle>
            {/* <CardDescription>
              Your organization has {members?.length} members with various
              roles.
            </CardDescription> */}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {members?.map((member) => (
                <div
                  key={member.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-4">
                    <Avatar className="h-10 w-10">
                      <AvatarImage
                        src={member.user.profilePicture || "/placeholder.svg"}
                        alt={member.user.username}
                      />
                      <AvatarFallback>
                        {member.user.username.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{member.user.username}</p>
                      <p className="text-sm text-muted-foreground">
                        {truncate(member.user.walletAddress, 4, 4)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={`
                        ${
                          member.role === "ADMIN"
                            ? "border-purple-200 text-purple-700 dark:border-purple-800 dark:text-purple-400"
                            : ""
                        }
                        ${
                          member.role === "CONTRIBUTOR"
                            ? "border-blue-200 text-blue-700 dark:border-blue-800 dark:text-blue-400"
                            : ""
                        }
                        ${
                          member.role === "MEMBER"
                            ? "border-gray-200 text-gray-700 dark:border-gray-800 dark:text-gray-400"
                            : ""
                        }
                      `}
                      >
                        {member.role.charAt(0).toUpperCase() +
                          member.role.slice(1)}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Joined on <DateComponent datetime={member.createdAt} />
                      </span>
                    </div>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {/* <DropdownMenuItem
                          onClick={() => handleRoleChange(member)}
                        >
                          Change Role
                        </DropdownMenuItem> */}

                        {member.role !== "CONTRIBUTOR" &&
                          currentUserRole === "CONTRIBUTOR" && (
                            <DropdownMenuItem
                              onClick={() =>
                                handleNominateAsContributor(member)
                              }
                            >
                              Nominate as Contributor
                            </DropdownMenuItem>
                          )}

                        <DropdownMenuItem
                          onClick={() =>
                            router.push(`/p/${member.user.username}`)
                          }
                        >
                          View Profile
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          disabled={
                            user?.id === member.user.externalId ||
                            currentUserRole !== "CONTRIBUTOR"
                          }
                          className="text-red-600 dark:text-red-400"
                        >
                          Remove Member
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Invite Member</DialogTitle>
            <DialogDescription>
              Invite a new member to join your organization.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="address">Wallet Address</Label>
              <Input id="address" placeholder="Enter Solana wallet address" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Initial Role</Label>
              <Select defaultValue="member">
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Member</SelectItem>
                  <SelectItem value="contributor">Contributor</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Note: Contributor role requires approval from existing
                contributors.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowInviteModal(false)}>
              Cancel
            </Button>
            <Button type="submit">Send Invitation</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              This will initiate a vote to change the member&apos;s role.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-10 w-10">
                  <AvatarImage
                    src={
                      selectedMember.user.profilePicture || "/placeholder.svg"
                    }
                    alt={selectedMember.user.username}
                  />
                  <AvatarFallback>
                    {selectedMember.user.username.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">{selectedMember.user.username}</p>
                  <p className="text-sm text-muted-foreground">
                    {truncate(selectedMember.user.walletAddress, 4, 4)}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newRole">New Role</Label>
                <Select defaultValue={selectedMember.role}>
                  <SelectTrigger id="newRole">
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MEMBER">Member</SelectItem>
                    <SelectItem value="CONTRIBUTOR">Contributor</SelectItem>
                    <SelectItem value="ADMIN">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reason">Reason for Change</Label>
                <Input
                  id="reason"
                  placeholder="Explain why this role change is needed"
                />
              </div>

              <div className="bg-amber-50 p-3 rounded-md text-amber-800 text-sm dark:bg-amber-900/20 dark:text-amber-400">
                <Users className="h-4 w-4 inline-block mr-2" />
                This change will require approval from existing contributors.
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRoleModal(false)}>
              Cancel
            </Button>
            {/* <Button type="submit" onClick={handleNominateMember}>
              Propose Change
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
