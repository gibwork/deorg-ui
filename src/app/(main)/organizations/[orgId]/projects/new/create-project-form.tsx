"use client";

import type React from "react";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, Loader2, Plus, Trash2, Users } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { useOrganizationMembers } from "@/features/organizations/hooks/use-organization-members";
import { Member } from "@/types/types.organization";
import { Checkbox } from "@/components/ui/checkbox";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
import { toast } from "sonner";
import { createProjectTransaction } from "@/features/organizations/actions/projects/create-project-transaction";
import { Transaction } from "@solana/web3.js";
import { useWallet } from "@solana/wallet-adapter-react";
import { createProject } from "@/features/organizations/actions/projects/create-project";
export default function CreateProjectForm() {
  const params = useParams();
  const router = useRouter();
  const { signTransaction } = useWallet();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [milestones, setMilestones] = useState([{ title: "", dueDate: "" }]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const {
    startTransaction,
    updateStep,
    setTxHash,
    updateStatus,
    addWarning,
    resetTransaction,
  } = useTransactionStore.getState();
  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembers(
    params?.orgId as string
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!signTransaction) {
      toast.error("No wallet connected");
      return;
    }

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      toast.dismiss();
      const transactionId = startTransaction("Create project proposal");

      updateStep(1, "loading", "Preparing transaction details...");

      const { success: createProposalTx, error } =
        await createProjectTransaction({
          organizationId: params.orgId as string,
          name: title,
          description,
          members: selectedMembers,
          projectProposalThreshold: 60,
          projectProposalValidityPeriod: 30,
        });

      if (error) {
        throw new Error(error?.message);
      }

      updateStep(1, "success");
      updateStep(2, "loading", "Please sign the transaction in your wallet");

      const retreivedTx = Transaction.from(
        Buffer.from(createProposalTx.serializedTransaction, "base64")
      );

      const serializedTx = await signTransaction(retreivedTx);

      const serializedSignedTx = serializedTx?.serialize().toString("base64");

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const createProjectResponse = await createProject({
        transactionId: createProposalTx.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (createProjectResponse.error) {
        throw new Error(createProjectResponse.error.message);
      }

      updateStep(4, "success");
      updateStatus("success");

      // Redirect back to projects page after successful creation
      router.push(`/organizations/${params.orgId}/projects`);
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
      setIsSubmitting(false);
    }
  };

  const toggleMemberSelection = (member: Member) => {
    setSelectedMembers((prev) =>
      prev.includes(member.user.walletAddress)
        ? prev.filter((address) => address !== member.user.walletAddress)
        : [...prev, member.user.walletAddress]
    );
  };

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Project
        </h1>
        <p className="text-muted-foreground">
          Create a project proposal that contributors can vote on. Once
          approved, you can add tasks and assign contributors.
        </p>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Project Details</CardTitle>
            <CardDescription>
              Provide the basic information about your project.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-2">
              <Label htmlFor="title">Project Title</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter project title"
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this project aims to accomplish"
                disabled={isSubmitting}
                rows={3}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center">
                  <Label>Team Members</Label>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users className="h-4 w-4" />
                    {selectedMembers.length} selected
                  </div>
                </div>
                <span className="text-xs text-muted-foreground">
                  Select team members to add to the project.
                </span>
              </div>

              <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                {isLoadingMembers ? (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </div>
                ) : (
                  members
                    ?.filter((member) => member.role === "CONTRIBUTOR")
                    .map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center gap-4 p-2 hover:bg-muted rounded-md max-h-44"
                      >
                        <Checkbox
                          id={`member-${member.id}`}
                          checked={selectedMembers.includes(
                            member.user.walletAddress
                          )}
                          onCheckedChange={() => toggleMemberSelection(member)}
                          disabled={isSubmitting}
                        />
                        <Avatar className="h-8 w-8">
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
                          <Label
                            htmlFor={`member-${member.id}`}
                            className="font-medium"
                          >
                            {member.user.username}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {member.role}
                          </p>
                        </div>
                      </div>
                    ))
                )}
              </div>
            </div>

            <Separator className="my-4" />

            <div className="pt-4 bg-amber-50 p-3 rounded-md text-amber-800 text-sm dark:bg-amber-900/20 dark:text-amber-400">
              <p>
                This project will require approval from contributors through
                voting before it can be started. Once approved, you&apos;ll be
                able to add tasks and assign contributors.
              </p>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                router.push(`/organizations/${params.orgId}/projects`)
              }
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating...
                </>
              ) : (
                "Create Project Proposal"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
