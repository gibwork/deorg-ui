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
export default function CreateProjectForm() {
  const params = useParams();
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [budget, setBudget] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [milestones, setMilestones] = useState([{ title: "", dueDate: "" }]);
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { data: members, isLoading: isLoadingMembers } = useOrganizationMembers(
    params?.orgId as string
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setError("Project title is required");
      return;
    }

    if (!budget || isNaN(Number(budget)) || Number(budget) <= 0) {
      setError("Please enter a valid budget amount");
      return;
    }

    if (!startDate) {
      setError("Start date is required");
      return;
    }

    if (!endDate) {
      setError("End date is required");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      // This is where you would connect to Solana to create the project proposal
      // For now, we'll just simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Redirect back to projects page after successful creation
      router.push(`/organizations/${params.orgId}/projects`);
    } catch (err) {
      setError("Failed to create project. Please try again.");
      console.error(err);
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
