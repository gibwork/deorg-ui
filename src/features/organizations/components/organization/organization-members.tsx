"use client";

import { useEffect, useState } from "react";
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
import { nominateContributor } from "../../actions/members/nominate-contributor";
import { proposeContributorRequest } from "@/actions/post/propsose-contributor-request";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { useOrganizationMembers } from "../../hooks/use-organization-members";
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

  const { data: members, isLoading } = useOrganizationMembers(organizationId);

  const handleRoleChange = (member: Member) => {
    setSelectedMember(member);
    setShowRoleModal(true);
  };

  const handleNominateAsContributor = async (member: Member) => {
    if (!publicKey || !signTransaction) return;
    try {
      const { success, error } = await proposeContributorRequest(
        organizationId,
        member.id
      );
      if (error) {
        toast.error("Failed to propose contributor request");
      }

      const retreivedTx = Transaction.from(
        Buffer.from(success.serializedTransaction, "base64")
      );

      console.log(success.serializedTransaction);

      const serializedTx = await signTransaction(retreivedTx);

      const transactionResponse = await nominateContributor({
        organizationId,
        transactionId: success.transactionId,
        serializedTransaction: serializedTx?.serialize().toString("base64"),
      });

      if (transactionResponse.error) {
        toast.error(
          transactionResponse.error.message || "Failed to nominate member"
        );
      }

      toast.success("Contributor request proposed");
    } catch (error) {
      console.error(error);
      toast.error("Failed to propose contributor request");
    }
  };

  // const nominateContributorMutation = useMutation({
  //   mutationFn: nominateContributor,
  //   onSuccess: (data) => {
  //     if (data.error) {
  //       toast.error(data.error.message || "Failed to nominate member", {
  //         position: "top-right",
  //       });
  //       return;
  //     }

  //     queryClient.invalidateQueries({
  //       queryKey: ["organization", organizationId],
  //     });

  //     // Successfully nominated
  //     toast.success("Member nominated as contributor");
  //   },
  //   onError: (error) => {
  //     console.error(error);
  //     toast.error("An unexpected error occurred while nominating the member");
  //   },
  //   onSettled: () => {
  //     toast.dismiss();
  //   },
  // });

  // const handleNominateMember = async () => {
  //   if (selectedMember) {
  //     toast.loading("Nominating member...");
  //     nominateContributorMutation.mutate({
  //       organizationId,
  //       candidateId: selectedMember.id,
  //     });
  //     setShowRoleModal(false);
  //     setSelectedMember(null);
  //   }
  // };
  // Mock data for contributors
  const contributors = [
    {
      id: 1,
      name: "Alice",
      address: "alice.sol",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "admin",
      rateType: "hourly",
      rate: 50,
      totalEarned: 1250,
      lastPaid: "June 1, 2023",
    },
    {
      id: 2,
      name: "Bob",
      address: "bob.sol",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "contributor",
      rateType: "fixed",
      rate: 500,
      totalEarned: 2000,
      lastPaid: "June 5, 2023",
    },
    {
      id: 3,
      name: "Charlie",
      address: "charlie.sol",
      avatar: "/placeholder.svg?height=40&width=40",
      role: "contributor",
      rateType: "hourly",
      rate: 40,
      totalEarned: 800,
      lastPaid: "June 10, 2023",
    },
  ];

  // Mock data for payment history
  const paymentHistory = [
    {
      id: 1,
      recipient: "Alice",
      recipientAddress: "alice.sol",
      amount: 250,
      date: "June 1, 2023",
      status: "completed",
      txHash: "5xT...",
    },
    {
      id: 2,
      recipient: "Bob",
      recipientAddress: "bob.sol",
      amount: 500,
      date: "June 5, 2023",
      status: "completed",
      txHash: "7zR...",
    },
    {
      id: 3,
      recipient: "Charlie",
      recipientAddress: "charlie.sol",
      amount: 200,
      date: "June 10, 2023",
      status: "completed",
      txHash: "9qP...",
    },
  ];
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <Loader2 className="h-4 w-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Members</h2>
          <p className="text-muted-foreground">
            Manage members and their roles in your organization.
          </p>
        </div>
        <Button onClick={() => setShowInviteModal(true)}>
          <UserPlus className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </div>

      <Tabs defaultValue="members" className="w-full">
        {/* <TabsList>
          <TabsTrigger value="members">Members</TabsTrigger>
          <TabsTrigger value="payroll">Payroll</TabsTrigger>
          <TabsTrigger value="history">Payment History</TabsTrigger>
        </TabsList> */}

        <TabsContent value="members" className="mt-6">
          <div className="grid gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Organization Members</CardTitle>
                <CardDescription>
                  Your organization has {members?.length} members with various
                  roles.
                </CardDescription>
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
                            src={
                              member.user.profilePicture || "/placeholder.svg"
                            }
                            alt={member.user.username}
                          />
                          <AvatarFallback>
                            {member.user.username.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium">{member.user.username}</p>
                          <p className="text-sm text-muted-foreground">
                            {truncate(member.user.primaryWallet, 4, 4)}
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
                            Joined on{" "}
                            <DateComponent datetime={member.createdAt} />
                          </span>
                        </div>

                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => handleRoleChange(member)}
                            >
                              Change Role
                            </DropdownMenuItem>

                            {member.role !== "CONTRIBUTOR" && (
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
                              disabled={user?.id === member.user.externalId}
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
        </TabsContent>

        <TabsContent value="payroll" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contributor Rates</CardTitle>
              <CardDescription>
                View and manage rates for all contributors in the organization.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contributors.map((contributor) => (
                  <div
                    key={contributor.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <Avatar className="h-10 w-10">
                        <AvatarImage
                          src={contributor.avatar || "/placeholder.svg"}
                          alt={contributor.name}
                        />
                        <AvatarFallback>
                          {contributor.name.charAt(0)}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">{contributor.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.address}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">
                          {contributor.rate} SOL{" "}
                          {contributor.rateType === "hourly"
                            ? "/ hour"
                            : "/ project"}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {contributor.rateType.charAt(0).toUpperCase() +
                            contributor.rateType.slice(1)}{" "}
                          rate
                        </p>
                      </div>

                      <div className="text-right">
                        <p className="font-medium">
                          {contributor.totalEarned} SOL
                        </p>
                        <p className="text-sm text-muted-foreground">
                          Total earned
                        </p>
                      </div>

                      <Button variant="outline" size="sm">
                        Pay Now
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Payment History</CardTitle>
              <CardDescription>
                View all payments made to contributors.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {paymentHistory.map((payment) => (
                  <div
                    key={payment.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <div className="rounded-full p-2 bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{payment.recipient}</p>
                        <p className="text-sm text-muted-foreground">
                          {payment.recipientAddress}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <p className="font-medium">{payment.amount} SOL</p>
                        <p className="text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 inline mr-1" />
                          {payment.date}
                        </p>
                      </div>

                      <Badge
                        variant="outline"
                        className="bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-800"
                      >
                        {payment.status.charAt(0).toUpperCase() +
                          payment.status.slice(1)}
                      </Badge>

                      <Button variant="ghost" size="sm" className="text-xs">
                        View Tx
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

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
                    {truncate(selectedMember.user.primaryWallet, 4, 4)}
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
