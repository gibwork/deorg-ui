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
import { Skeleton } from "@/components/ui/skeleton";
import {
  MoreHorizontal,
  UserPlus,
  Users,
  Loader2,
  DollarSign,
  Clock,
  Crown,
  Star,
  User,
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

// Role configuration with icons and colors
const roleConfig = {
  ADMIN: {
    icon: Crown,
    label: "Admin",
    color: "bg-gradient-to-r from-purple-500 to-purple-600 text-white",
    borderColor: "border-purple-200 dark:border-purple-800",
    textColor: "text-purple-700 dark:text-purple-400",
  },
  CONTRIBUTOR: {
    icon: Star,
    label: "Contributor",
    color: "bg-gradient-to-r from-blue-500 to-blue-600 text-white",
    borderColor: "border-blue-200 dark:border-blue-800",
    textColor: "text-blue-700 dark:text-blue-400",
  },
  MEMBER: {
    icon: User,
    label: "Member",
    color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
    borderColor: "border-gray-200 dark:border-gray-800",
    textColor: "text-gray-700 dark:text-gray-400",
  },
};

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
    return <MembersLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-border/50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="flex items-center gap-2 text-xl sm:text-2xl font-semibold">
              <Users className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              Organization Members
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground">
              {members?.length} {members?.length === 1 ? "member" : "members"}{" "}
              in this organization.
            </p>
          </div>
          {/* Uncomment when invite functionality is ready */}
          {/* <Button 
            onClick={() => setShowInviteModal(true)}
            className="w-full sm:w-auto"
            size="sm"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Invite Member
          </Button> */}
        </div>
      </div>

      {/* Members List */}
      <div className="space-y-3 sm:space-y-4">
        {members?.map((member) => {
          const roleInfo = roleConfig[member.role as keyof typeof roleConfig];
          const RoleIcon = roleInfo.icon;

          return (
            <div
              key={member.id}
              className="group flex items-center justify-between p-4 sm:p-6 border rounded-xl bg-gradient-to-r from-background to-muted/20 hover:shadow-md transition-all duration-200 hover:border-primary/20"
            >
              <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
                <div className="relative">
                  <Avatar className="h-12 w-12 sm:h-14 sm:w-14 ring-2 ring-background shadow-lg">
                    <AvatarImage
                      src={member.user.profilePicture || "/placeholder.svg"}
                      alt={member.user.username}
                      className="object-cover"
                    />
                    <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/30 text-primary font-semibold">
                      {member.user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div
                    className={`absolute -bottom-1 -right-1 p-1 rounded-full ${roleInfo.color} shadow-lg`}
                  >
                    <RoleIcon className="h-3 w-3" />
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm sm:text-base truncate">
                    {member.user.username}
                  </p>
                  <p className="text-xs sm:text-sm text-muted-foreground font-mono">
                    {truncate(member.user.walletAddress, 4, 4)}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
                <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-3">
                  <Badge
                    variant="outline"
                    className={`${roleInfo.borderColor} ${roleInfo.textColor} font-medium text-xs px-2 py-1`}
                  >
                    <RoleIcon className="h-3 w-3 mr-1" />
                    <span className="hidden sm:inline">{roleInfo.label}</span>
                    <span className="sm:hidden">
                      {roleInfo.label.charAt(0)}
                    </span>
                  </Badge>
                  <span className="text-xs text-muted-foreground hidden sm:block whitespace-nowrap">
                    Joined <DateComponent datetime={member.createdAt} />
                  </span>
                </div>

                {/* <DropdownMenu >
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 opacity-60 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    {member.role !== "CONTRIBUTOR" &&
                      currentUserRole === "CONTRIBUTOR" && (
                        <DropdownMenuItem
                          onClick={() => handleNominateAsContributor(member)}
                          className="text-blue-600 dark:text-blue-400"
                        >
                          <Star className="h-4 w-4 mr-2" />
                          Nominate as Contributor
                        </DropdownMenuItem>
                      )}

                    <DropdownMenuItem
                      onClick={() => router.push(`/p/${member.user.username}`)}
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      disabled={
                        user?.id === member.user.externalId ||
                        currentUserRole !== "CONTRIBUTOR"
                      }
                      className="text-red-600 dark:text-red-400"
                    >
                      <Users className="h-4 w-4 mr-2" />
                      Remove Member
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu> */}
              </div>
            </div>
          );
        })}
      </div>

      {/* Invite Member Modal */}
      <Dialog open={showInviteModal} onOpenChange={setShowInviteModal}>
        <DialogContent className="sm:max-w-[425px] mx-4">
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowInviteModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button type="submit" className="w-full sm:w-auto">
              Send Invitation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Change Role Modal */}
      <Dialog open={showRoleModal} onOpenChange={setShowRoleModal}>
        <DialogContent className="sm:max-w-[425px] mx-4">
          <DialogHeader>
            <DialogTitle>Change Member Role</DialogTitle>
            <DialogDescription>
              This will initiate a vote to change the member&apos;s role.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4 py-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <Avatar className="h-12 w-12">
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
                  <p className="text-sm text-muted-foreground font-mono">
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
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => setShowRoleModal(false)}
              className="w-full sm:w-auto"
            >
              Cancel
            </Button>
            {/* <Button type="submit" onClick={handleNominateMember} className="w-full sm:w-auto">
              Propose Change
            </Button> */}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Skeleton loading component
export function MembersLoadingSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <div className="bg-gradient-to-r from-primary/5 to-primary/10 border border-border/50 rounded-xl p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
      </div>

      {/* Members List Skeleton */}
      <div className="space-y-3 sm:space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <MemberSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}

function MemberSkeleton() {
  return (
    <div className="flex items-center justify-between p-4 sm:p-6 border rounded-xl bg-gradient-to-r from-background to-muted/20">
      <div className="flex items-center gap-3 sm:gap-4 flex-1 min-w-0">
        <Skeleton className="h-12 w-12 rounded-full flex-shrink-0" />
        <div className="space-y-2 flex-1 min-w-0">
          <Skeleton className="h-4 w-24 sm:w-32" />
          <Skeleton className="h-3 w-20 sm:w-28" />
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0">
        <div className="hidden sm:flex items-center gap-2">
          <Skeleton className="h-6 w-16" />
          <Skeleton className="h-3 w-20" />
        </div>
        <div className="sm:hidden">
          <Skeleton className="h-6 w-12" />
        </div>
        <Skeleton className="h-8 w-8 rounded-md" />
      </div>
    </div>
  );
}
