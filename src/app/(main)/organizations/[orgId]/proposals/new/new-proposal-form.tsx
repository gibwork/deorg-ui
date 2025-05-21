"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Transaction } from "@solana/web3.js";

import { Switch } from "@/components/ui/switch";
import { ArrowLeft, ArrowRight, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn, truncate } from "@/lib/utils";
import { useOrganizationMembers } from "@/features/organizations/hooks/use-organization-members";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Member, ProjectDetails } from "@/types/types.organization";
import { useWallet } from "@solana/wallet-adapter-react";
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
import { toast } from "sonner";
import { proposeContributorRequest } from "@/actions/post/propsose-contributor-request";
import { useQueryClient } from "@tanstack/react-query";
import { createContributorProposal } from "@/features/organizations/actions/members/create-proposal-contributor";
import { createProjectTransaction } from "@/features/organizations/actions/projects/create-project-transaction";
import { createProject } from "@/features/organizations/actions/projects/create-project";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { LoaderButton } from "@/components/loader-button";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useOrganizationProjects } from "@/features/organizations/hooks/use-organization-projects";
import { createTaskTransaction } from "@/features/organizations/actions/tasks/create-task-transaction";
import { createTask } from "@/features/organizations/actions/tasks/create-task";
const proposalFormSchema = z
  .object({
    proposalType: z.string().min(1, "Please select a proposal type"),
    title: z.string().optional(),
    description: z.string().optional(),
    requiresFunding: z.boolean().default(false),
    amount: z.coerce.number().optional(),
    selectedMember: z.string().optional(),
    role: z.string().optional(),
    projectName: z
      .string()
      .max(32, "Project name must be at most 32 characters")
      .optional(),
    projectDescription: z.string().optional(),
    projectDuration: z.string().optional(),
    projectMembers: z.array(z.string()).optional(),
    projectProposalThreshold: z.coerce
      .number({ message: "Required." })
      .min(50, { message: "Minimum 50 %" })
      .optional(),
    projectProposalValidityPeriod: z.coerce
      .number({ message: "Required." })
      .min(7, { message: "Minimum 7 days" })
      .optional(),
    taskName: z
      .string()
      .max(32, "Task name must be at most 32 characters")
      .optional(),
    taskDescription: z.string().optional(),
    taskDeadline: z.string().optional(),
    taskPriority: z.string().default("medium"),
    selectedProject: z.string().optional(),
    assignedMember: z.string().optional(),
  })

  .refine(
    (data) => {
      if (data.proposalType === "member" && !data.selectedMember) {
        return false;
      }
      return true;
    },
    {
      message: "Please select a member",
      path: ["selectedMember"],
    }
  )
  .refine(
    (data) => {
      if (
        data.proposalType === "project" &&
        (!data.projectMembers || data.projectMembers.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Please select at least one member for the project",
      path: ["projectMembers"],
    }
  )
  .refine(
    (data) => {
      if (data.proposalType === "task" && !data.taskName) {
        return false;
      }
      return true;
    },
    {
      message: "Task name is Required",
      path: ["taskName"],
    }
  )
  .refine(
    (data) => {
      if (data.proposalType === "project" && !data.projectName) {
        return false;
      }
      return true;
    },
    {
      message: "Project name is required",
      path: ["projectName"],
    }
  )
  .refine(
    (data) => {
      if (data.proposalType === "project" && !data.projectDescription) {
        return false;
      }
      return true;
    },
    {
      message: "Project description is required",
      path: ["projectDescription"],
    }
  )
  .refine(
    (data) => {
      if (data.proposalType === "task" && !data.taskDescription) {
        return false;
      }
      return true;
    },
    {
      message: "Task description is required",
      path: ["taskDescription"],
    }
  )
  .refine(
    (data) => {
      if (
        data.proposalType === "task" &&
        data.requiresFunding &&
        (!data.amount || data.amount <= 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message: "Amount is required for task funding",
      path: ["amount"],
    }
  );

type ProposalFormDataType = z.infer<typeof proposalFormSchema>;

type Step = {
  id: string;
  name: string;
  fields: (keyof ProposalFormDataType)[];
};

const FORM_STEPS: Step[] = [
  {
    id: "type",
    name: "Select Proposal Type",
    fields: ["proposalType"],
  },
  {
    id: "details",
    name: "Proposal Details",
    fields: ["title", "description", "requiresFunding", "amount"],
  },
  {
    id: "voting",
    name: "Additional Details",
    fields: ["projectProposalThreshold", "projectProposalValidityPeriod"],
  },
  {
    id: "review",
    name: "Review",
    fields: [],
  },
];

export default function NewProposalForm({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const transactionStatus = useTransactionStatus();
  const walletModal = useWalletModal();
  const { publicKey, signTransaction } = useWallet();
  const {
    startTransaction,
    updateStep,
    setTxHash,
    updateStatus,
    addWarning,
    resetTransaction,
  } = useTransactionStore.getState();
  const { data: orgMembers, isLoading: isLoadingMembers } =
    useOrganizationMembers(orgId);

  const { data: orgProjects, isLoading: isLoadingProjects } =
    useOrganizationProjects(orgId, "active");

  const orgMembersData = orgMembers?.filter(
    (member) => member.role !== "CONTRIBUTOR"
  );

  const form = useForm<ProposalFormDataType>({
    resolver: zodResolver(proposalFormSchema),
    defaultValues: {
      proposalType: "",
      title: "",
      description: "",
      requiresFunding: true,
      amount: undefined,
      selectedMember: "",
      role: "",
      projectName: "",
      projectDuration: "",
      taskName: "",
      taskDeadline: "",
      taskPriority: "medium",
      projectProposalThreshold: 60,
      projectProposalValidityPeriod: 7,
    },
  });

  const { watch } = form;
  const currentValues = watch();

  const nextStep = async () => {
    let fieldsToValidate: (keyof ProposalFormDataType)[] = [];

    if (currentStep === 0) {
      fieldsToValidate = ["proposalType"];
    }

    if (currentStep === 1 && currentValues.proposalType === "member") {
      fieldsToValidate = ["selectedMember"];
    }

    if (currentStep === 1 && currentValues.proposalType === "project") {
      fieldsToValidate = ["projectName", "projectMembers"];
    }

    if (currentStep === 1 && currentValues.proposalType === "task") {
      fieldsToValidate = ["taskName", "taskDescription", "amount"];
    }

    if (currentStep === 2 && currentValues.proposalType === "project") {
      fieldsToValidate = ["projectName", "projectDuration"];
    }

    if (currentStep === 2 && currentValues.proposalType === "task") {
      fieldsToValidate = ["selectedProject", "assignedMember"];
    }

    //TODO: Add validation to check treasury balance for task creation

    const output = await form.trigger(fieldsToValidate as any, {
      shouldFocus: true,
    });

    if (!output) return;

    if (currentStep < FORM_STEPS.length - 1) {
      if (currentStep === 1 && currentValues.proposalType === "member") {
        setCurrentStep((step) => step + 2);
      } else {
        setCurrentStep((step) => step + 1);
      }
    } else {
      await form.handleSubmit(onSubmit)();
    }
  };
  const prevStep = () => {
    if (currentStep === 3 && currentValues.proposalType === "member") {
      setCurrentStep((prev) => Math.max(prev - 2, 0));
    } else {
      setCurrentStep((prev) => Math.max(prev - 1, 0));
    }
  };

  const toggleMemberSelection = (
    member: Member,
    currentMembers: string[],
    onChange: (value: string[]) => void
  ) => {
    const newMembers = currentMembers.includes(member.user.walletAddress)
      ? currentMembers.filter(
          (address) => address !== member.user.walletAddress
        )
      : [...currentMembers, member.user.walletAddress];
    onChange(newMembers);
  };

  const handleCreateContributorProposal: SubmitHandler<
    ProposalFormDataType
  > = async (data) => {
    if (!publicKey || !signTransaction) return;

    if (!data.selectedMember) {
      return;
    }

    try {
      toast.dismiss();
      const transactionId = startTransaction(
        `Nominate ${truncate(data?.selectedMember, 4, 0)} as contributor`
      );

      updateStep(1, "loading", "Preparing transaction details...");
      const { success, error } = await proposeContributorRequest(
        orgId,
        data.selectedMember
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
        organizationId: orgId,
        transactionId: success.transactionId,
        serializedTransaction: serializedTx?.serialize().toString("base64"),
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (transactionResponse.error) {
        throw new Error(transactionResponse.error.message);
      }

      await queryClient.invalidateQueries({
        queryKey: ["organization_members", orgId],
      });

      await queryClient.invalidateQueries({
        queryKey: ["organization_proposals", orgId],
      });

      updateStep(4, "success");

      updateStatus("success");
      router.push(`/organizations/${orgId}`);
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

  const handleCreateProjectProposal: SubmitHandler<
    ProposalFormDataType
  > = async (data) => {
    if (!signTransaction) {
      toast.error("No wallet connected");
      return;
    }

    if (
      !data.projectName ||
      !data.projectMembers ||
      !data.projectProposalThreshold ||
      !data.projectProposalValidityPeriod ||
      !data.projectDescription
    ) {
      return;
    }

    try {
      toast.dismiss();
      const transactionId = startTransaction("Create project proposal");

      updateStep(1, "loading", "Preparing transaction details...");

      const { success: createProposalTx, error } =
        await createProjectTransaction({
          organizationId: orgId,
          name: data.projectName,
          description: data.projectDescription || "",
          members: data.projectMembers,
          projectProposalThreshold: data.projectProposalThreshold,
          projectProposalValidityPeriod: data.projectProposalValidityPeriod,
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
        organizationId: orgId,
        transactionId: createProposalTx.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (createProjectResponse.error) {
        throw new Error(createProjectResponse.error.message);
      }

      await queryClient.invalidateQueries({
        queryKey: ["organization_proposals", orgId],
      });

      updateStep(4, "success");
      updateStatus("success");

      // Redirect back to projects page after successful creation
      router.push(`/organizations/${orgId}`);
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

  const handleCreateTaskProposal: SubmitHandler<ProposalFormDataType> = async (
    data
  ) => {
    if (!signTransaction) {
      toast.error("No wallet connected");
      return;
    }

    if (
      !data.taskName ||
      !data.taskDescription ||
      !data.selectedProject ||
      !data.assignedMember ||
      !data.amount
    ) {
      return;
    }

    try {
      toast.dismiss();
      const transactionId = startTransaction("Create project proposal");

      updateStep(1, "loading", "Preparing transaction details...");

      const { success: createProposalTx, error } = await createTaskTransaction({
        title: data.taskName,
        description: data.taskDescription,
        projectAccountAddress: data.selectedProject,
        memberAccountAddress: data.assignedMember,
        paymentAmount: data.amount,
      });

      if (error) {
        throw new Error(error);
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

      const createProjectResponse = await createTask({
        organizationId: orgId,
        transactionId: createProposalTx.transactionId,
        serializedTransaction: serializedSignedTx,
      });

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming transaction...");

      if (createProjectResponse.error) {
        throw new Error(createProjectResponse.error);
      }

      await queryClient.invalidateQueries({
        queryKey: ["organization_proposals", orgId],
      });

      updateStep(4, "success");
      updateStatus("success");

      // Redirect back to projects page after successful creation
      router.push(`/organizations/${orgId}`);
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

  const onSubmit: SubmitHandler<ProposalFormDataType> = async (data) => {
    transactionStatus.onStart();
    if (currentValues.proposalType === "member") {
      await handleCreateContributorProposal(data);
    }

    if (currentValues.proposalType === "project") {
      await handleCreateProjectProposal(data);
    }

    if (currentValues.proposalType === "task") {
      await handleCreateTaskProposal(data);
    }
  };

  const stepProgress = ((currentStep + 1) / FORM_STEPS.length) * 100;

  const isLastStep = currentStep === FORM_STEPS.length - 1;
  return (
    <div className="max-w-3xl mx-auto py-6">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">
          Create New Proposal
        </h1>
        <p className="text-muted-foreground">
          Create a proposal for your organization to vote on.
        </p>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>{FORM_STEPS[currentStep]?.name}</CardTitle>
              <CardDescription>
                {currentStep === 0 &&
                  "Choose what type of proposal you want to create"}
                {currentStep === 1 && "Fill in the details for your proposal"}
                {currentStep === 2 &&
                  "Fill in the additional details for your proposal"}
                {currentStep === 3 && "Review your proposal before submitting"}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {currentStep === 0 && (
                <FormField
                  control={form.control}
                  name="proposalType"
                  render={({ field }) => (
                    <FormItem>
                      <FormControl>
                        <RadioGroup
                          onValueChange={field.onChange}
                          value={field.value}
                          className="space-y-4"
                        >
                          {/* <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="funding" id="funding" />
                            <FormLabel
                              htmlFor="funding"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">
                                General Proposal
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Create a proposal with or without funding
                                request
                              </div>
                            </FormLabel>
                          </div> */}

                          <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="member" id="member" />
                            <FormLabel
                              htmlFor="member"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">Nominate Member</div>
                              <div className="text-sm text-muted-foreground">
                                Nominate a member for a contributor role
                              </div>
                            </FormLabel>
                          </div>

                          <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="project" id="project" />
                            <FormLabel
                              htmlFor="project"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">
                                Project Proposal
                              </div>
                              <div className="text-sm text-muted-foreground">
                                Propose a new project for the organization
                              </div>
                            </FormLabel>
                          </div>

                          <div className="flex items-center space-x-2 rounded-md border p-4">
                            <RadioGroupItem value="task" id="task" />
                            <FormLabel
                              htmlFor="task"
                              className="flex-1 cursor-pointer"
                            >
                              <div className="font-medium">Task Proposal</div>
                              <div className="text-sm text-muted-foreground">
                                Propose a specific task to be completed
                              </div>
                            </FormLabel>
                          </div>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {currentStep === 1 && (
                <div className="space-y-6">
                  {currentValues.proposalType === "member" && (
                    <>
                      <FormField
                        control={form.control}
                        name="selectedMember"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Member</FormLabel>
                            <Select
                              value={field.value}
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {orgMembersData?.map((member) => (
                                  <SelectItem
                                    key={member.id}
                                    value={member.user.walletAddress}
                                  >
                                    <div>
                                      <div className="flex items-center gap-4">
                                        <Avatar className="h-7 w-7">
                                          <AvatarImage
                                            src={
                                              member.user.profilePicture ||
                                              "/placeholder.svg"
                                            }
                                            alt={member.user.username}
                                          />
                                          <AvatarFallback>
                                            {member.user.username.charAt(0)}
                                          </AvatarFallback>
                                        </Avatar>
                                        <div>
                                          <p className="font-medium">
                                            {member.user.username}
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Description{" "}
                              <span className="text-xs text-muted-foreground">
                                {"(Optional)"}
                              </span>
                            </FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this proposal is for"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* <FormField
                            control={form.control}
                            name="role"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Role</FormLabel>
                                <FormControl>
                                  <Input
                                    placeholder="Enter role (e.g., Developer, Designer)"
                                    {...field}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          /> */}
                    </>
                  )}

                  {currentValues.proposalType === "project" && (
                    <>
                      <FormField
                        control={form.control}
                        name="projectName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter project title"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this project aims to accomplish"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectMembers"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Project Members</FormLabel>
                            <FormControl>
                              <div className="space-y-2 max-h-[200px] overflow-y-auto p-2 border rounded-md">
                                {isLoadingMembers ? (
                                  <div className="flex items-center justify-center py-4">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                  </div>
                                ) : (
                                  orgMembers
                                    ?.filter(
                                      (member) => member.role === "CONTRIBUTOR"
                                    )
                                    .map((member) => (
                                      <div
                                        key={member.id}
                                        className="flex items-center gap-4 p-2 hover:bg-muted rounded-md max-h-44"
                                      >
                                        <Checkbox
                                          id={`member-${member.id}`}
                                          checked={field.value?.includes(
                                            member.user.walletAddress
                                          )}
                                          onCheckedChange={() =>
                                            toggleMemberSelection(
                                              member,
                                              field.value || [],
                                              field.onChange
                                            )
                                          }
                                          disabled={
                                            transactionStatus.isProcessing
                                          }
                                        />
                                        <Avatar className="h-8 w-8">
                                          <AvatarImage
                                            src={
                                              member.user.profilePicture ||
                                              "/placeholder.svg"
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
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {currentValues.proposalType === "task" && (
                    <>
                      <FormField
                        control={form.control}
                        name="taskName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Task Title</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Enter task title"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="taskDescription"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Description</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Describe what this task is for"
                                rows={3}
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {/* <FormField
                        control={form.control}
                        name="requiresFunding"
                        render={({ field }) => (
                          <FormItem className="flex items-center space-x-2">
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                            <FormLabel>
                              This proposal requires funding
                            </FormLabel>
                          </FormItem>
                        )}
                      /> */}
                      {currentValues.requiresFunding && (
                        <FormField
                          control={form.control}
                          name="amount"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Requested Amount</FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  placeholder="0.00"
                                  {...field}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      )}
                    </>
                  )}
                </div>
              )}
              {currentStep === 2 && (
                <div className="space-y-6">
                  {currentValues.proposalType === "project" && (
                    <>
                      <FormField
                        control={form.control}
                        name="projectProposalThreshold"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Proposal Threshold</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={100}
                                placeholder="e.g. 60"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="projectProposalValidityPeriod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>
                              Proposal Validity Period (Days)
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min={1}
                                max={30}
                                placeholder="e.g. 7"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}

                  {currentValues.proposalType === "task" && (
                    <>
                      {/* Add a formfield dropdown to select project from the organization and another formfield to select assigned member */}
                      <FormField
                        control={form.control}
                        name="selectedProject"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Select Project</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a project" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {orgProjects?.activeProjects?.map((project) => (
                                  <SelectItem
                                    key={project.uuid}
                                    value={project.accountAddress}
                                  >
                                    {project.title}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="assignedMember"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Assignee</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select a member" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {orgMembers
                                  ?.filter(
                                    (member) => member.role === "CONTRIBUTOR"
                                  )
                                  ?.map((member) => (
                                    <SelectItem
                                      key={member.id}
                                      value={member.user.walletAddress}
                                    >
                                      {member.user.username}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>
              )}

              {currentStep === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                    <div>
                      <h3 className="text-muted-foreground font-medium">
                        Proposal Type
                      </h3>
                      <p className="">
                        {currentValues.proposalType === "funding" &&
                          "General Proposal"}
                        {currentValues.proposalType === "member" &&
                          "Nominate Member"}
                        {currentValues.proposalType === "project" &&
                          "Project Proposal"}
                        {currentValues.proposalType === "task" &&
                          "Task Proposal"}
                      </p>
                    </div>

                    {currentValues.proposalType === "member" && (
                      <>
                        <div>
                          <h3 className="font-medium">Member</h3>
                          <p className="text-muted-foreground">
                            {orgMembersData?.find(
                              (m) =>
                                m.user.walletAddress ===
                                currentValues.selectedMember
                            )?.user.walletAddress ||
                              currentValues.selectedMember}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium">Role</h3>
                          <p className="text-muted-foreground">Contributor</p>
                        </div>
                      </>
                    )}

                    {currentValues.proposalType === "project" && (
                      <>
                        <div>
                          <h3 className="font-medium">Project Name</h3>
                          <p className="text-muted-foreground">
                            {currentValues.projectName}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium">Team Members</h3>
                          <p className="text-muted-foreground">
                            {currentValues.projectMembers?.map((member) => (
                              <div key={member}>{member}</div>
                            ))}
                          </p>
                        </div>
                      </>
                    )}

                    {currentValues.proposalType === "task" && (
                      <>
                        <div>
                          <h3 className="font-medium">Task Name</h3>
                          <p className="text-muted-foreground">
                            {currentValues.taskName}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium">Project</h3>
                          <p className="text-muted-foreground">
                            {currentValues.selectedProject}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium">Assignee</h3>
                          <p className="text-muted-foreground">
                            {currentValues.assignedMember}
                          </p>
                        </div>

                        <div>
                          <h3 className="font-medium">Task Amount</h3>
                          <p className="text-muted-foreground">
                            {currentValues.amount}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              )}
            </CardContent>

            <CardFooter className="flex justify-between">
              {currentStep > 0 ? (
                <Button type="button" variant="outline" onClick={prevStep}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
              ) : (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => router.push(`/organizations/${orgId}`)}
                >
                  Cancel
                </Button>
              )}

              {!isLastStep ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  disabled={transactionStatus.isProcessing}
                >
                  Next
                </Button>
              ) : !publicKey ? (
                <Button
                  type="button"
                  onClick={() => walletModal.setVisible(true)}
                >
                  Connect Wallet
                </Button>
              ) : (
                <LoaderButton
                  disabled={form.formState.isSubmitting}
                  isLoading={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting
                    ? "Sending Transaction..."
                    : "Submit Proposal"}
                </LoaderButton>
              )}
            </CardFooter>
          </Card>
        </form>
      </Form>
    </div>
  );
}
