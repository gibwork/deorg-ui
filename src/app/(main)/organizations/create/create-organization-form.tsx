"use client";

import React, { useMemo, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { FieldName, SubmitHandler, useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getTokenInfo } from "@/features/tasks/actions/get-token-info";
import { useDebounceCallback } from "usehooks-ts";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { LoaderCircle } from "lucide-react";
import { steps } from "framer-motion";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useWallet } from "@solana/wallet-adapter-react";
import { LoaderButton } from "@/components/loader-button";
import { User } from "@/types/user.types";
import { useAuth } from "@clerk/nextjs";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
import { formatTokenAmount } from "@/utils/format-amount";
import { Deposit, depositToken } from "@/actions/post/create-task";
import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
import { Transaction } from "@solana/web3.js";
import {
  createOrganization,
  prepareCreateOrganization,
} from "@/features/organizations/actions/create-organization";

const createOrganizationSchema = z.object({
  name: z
    .string()
    .min(3, "Organization name must be at least 3 characters")
    .max(50, "Organization name must not be longer than 50 characters"),
  description: z
    .string()
    .max(64, "Description must not be longer than 64 characters")
    .optional(),
  tokenAddress: z
    .string()
    .min(32, "Please enter a valid token address")
    .max(44, "Please enter a valid token address"),
  requiredTokenAmount: z.coerce
    .number({ message: "Please enter a valid token amount." })
    .min(1)
    .optional(),
  votingApprovalThreshold: z.coerce
    .number({ message: "Please enter a valid percentage." })
    .min(1)
    .max(100),
  votingPeriod: z.coerce
    .number({ message: "Please enter a valid number of days." })
    .min(1)
    .max(30),
  quorumPercentage: z.coerce
    .number({ message: "Please enter a valid percentage." })
    .min(1)
    .max(100),
  // rolePromotionRequirement: z.enum(["majority", "supermajority", "consensus"]),
});

type CreateOrganizationFormDataType = z.infer<typeof createOrganizationSchema>;

type Step = {
  id: string;
  name: string;
  fields: (keyof CreateOrganizationFormDataType)[];
};

const FORM_STEPS: Step[] = [
  {
    id: "Organization Details",
    name: "Organization Details",
    fields: ["name", "description"],
  },
  {
    id: "Token Configuration",
    name: "Token Configuration",
    fields: ["tokenAddress", "requiredTokenAmount"],
  },
  {
    id: "Voting Configuration",
    name: "Voting Configuration",
    fields: [
      "votingApprovalThreshold",
      "votingPeriod",
      "quorumPercentage",
      // "rolePromotionRequirement",
    ],
  },
  {
    id: "Review",
    name: "Review",
    fields: [],
  },
];

export function CreateOrganizationForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { publicKey, signTransaction } = useWallet();
  const walletModal = useWalletModal();
  const [currentStep, setCurrentStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<CreateOrganizationFormDataType>({
    resolver: zodResolver(createOrganizationSchema),
    defaultValues: {
      name: "",
      description: "",
      tokenAddress: "",
      votingApprovalThreshold: 60,
      votingPeriod: 7,
      quorumPercentage: 60,
      // rolePromotionRequirement: "majority",
    },
  });

  const { watch } = form;
  const currentValues = watch();

  const userData = queryClient.getQueryData<User>([`user-${userId}`]);

  const {
    selectedPriority,
    maxPriorityFee,
    exactPriorityFee,
    isPriorityFeeModeMaxCap,
  } = usePriorityFeeLevelStore();
  const {
    data: walletTokensData,
    error,
    isLoading: walletTokensLoading,
    refetch,
    isRefetching: isWalletTokensRefetching,
  } = useWalletTokenBalances({
    enabled: !!userData && !!userData?.walletAddress,
  });

  const {
    data: tokenInfo,
    mutate: getTokenInfoFn,
    isPending: isPendingTokenInfo,
    error: getTokenInfoError,
    reset: resetTokenInfo,
  } = useMutation({
    mutationFn: getTokenInfo,
    onSuccess: (data) => {
      if (data.error) throw new Error(data.error);
      form.clearErrors("tokenAddress");
    },
    onError: (error) => {
      form.setError("tokenAddress", {
        message: "Invalid token address",
      });
    },
  });

  const solBalance = useMemo(() => {
    if (!walletTokensData) {
      return 0;
    }
    const availableSOl = walletTokensData?.find(
      (token: any) =>
        token.address == "So11111111111111111111111111111111111111112"
    );
    if (!availableSOl) return 0;
    return formatTokenAmount(
      availableSOl?.tokenInfo.balance || 0,
      availableSOl?.tokenInfo.decimals
    );
  }, [walletTokensData]);

  const debouncedTokenValidate = useDebounceCallback((tokenAddress: string) => {
    if (!tokenAddress) return;
    getTokenInfoFn(tokenAddress);
  }, 800);

  const onSubmit: SubmitHandler<CreateOrganizationFormDataType> = async (
    data
  ) => {
    setIsLoading(true);
    try {
      if (!publicKey || !signTransaction) return;

      const prepareCreateOrganizationResponse = await prepareCreateOrganization(
        {
          name: data.name,
          contributorProposalThreshold: data.votingApprovalThreshold,
          contributorProposalValidityPeriod: data.votingPeriod,
          contributorValidityPeriod: 30,
          contributorProposalQuorumPercentage: data.quorumPercentage,
          projectProposalValidityPeriod: data.votingPeriod,
          projectProposalThreshold: data.votingApprovalThreshold,
          minimumTokenRequirement: data.requiredTokenAmount!,
          // rolePromotionRequirement: data.rolePromotionRequirement,
        }
      );

      if (prepareCreateOrganizationResponse.error) {
        throw new Error(prepareCreateOrganizationResponse.error.message);
      }
      const retreivedTx = Transaction.from(
        Buffer.from(
          prepareCreateOrganizationResponse.success.serializedTransaction,
          "base64"
        )
      );

      const serializedTx = await signTransaction(retreivedTx);

      const requiredTokenData = {
        mintAddress: data.tokenAddress,
        symbol: tokenInfo?.success?.symbol!,
        imageUrl: tokenInfo?.success?.logoURI!,
        amount: data.requiredTokenAmount!,
      };

      const confirmTxPayload = {
        transactionId: prepareCreateOrganizationResponse.success.transactionId,
        serializedTransaction: serializedTx?.serialize().toString("base64"),
        name: data.name,
        description: data?.description,
        token: requiredTokenData,
      };
      const createOrganizationResponse = await createOrganization(
        confirmTxPayload
      );
      // console.log(createOrganizationResponse);
      if (createOrganizationResponse.error) {
        throw new Error(createOrganizationResponse.error.message);
      } else {
        toast.success("Organization created successfully!");
        router.push(`/organizations/${createOrganizationResponse.success.id}`);
      }
    } catch (error) {
      toast.error("Failed to create organization. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  type FieldName = keyof CreateOrganizationFormDataType;

  const nextStep = async () => {
    const fieldsToValidate = FORM_STEPS.slice(0, currentStep + 1).flatMap(
      (step) => step.fields
    );

    const output = await form.trigger(fieldsToValidate as FieldName[], {
      shouldFocus: true,
    });

    if (!output) return;

    if (currentStep === 1) {
      if (!form.getValues("tokenAddress")) {
        form.setError("tokenAddress", {
          type: "manual",
          message:
            "Token address must be provided if 'Token Required' is enabled.",
        });
        return;
      } else if (getTokenInfoError) {
        form.setError("tokenAddress", {
          type: "manual",
          message: "Invalid token address.",
        });
      }

      if (
        form.getValues("requiredTokenAmount") === undefined ||
        form.getValues("requiredTokenAmount")! < 1
      ) {
        form.setError("requiredTokenAmount", {
          type: "manual",
          message: "Please enter a valid token amount.",
        });
        return;
      }
    }

    if (currentStep < FORM_STEPS.length) {
      if (currentStep === FORM_STEPS.length - 1) {
        await form.handleSubmit(onSubmit)();
      }
      setCurrentStep((step) => step + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 0));
  };

  const isLastStep = currentStep === FORM_STEPS.length - 1;
  const stepProgress = ((currentStep + 1) / FORM_STEPS.length) * 100;

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {FORM_STEPS.map((step, index) => (
            <div
              key={step.id}
              className={cn(
                "flex-1 text-center",
                index === currentStep ? "text-primary" : "text-muted-foreground"
              )}
            >
              {step.name}
            </div>
          ))}
        </div>
        <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
          <div
            className="h-full bg-theme transition-all duration-300 ease-in-out"
            style={{ width: `${stepProgress}%` }}
          />
        </div>
      </div>

      <div className="bg-card border rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">
                    Create a new organization
                  </h1>
                  <p className="text-muted-foreground mt-2">
                    Give your organization a name. You can always adjust the
                    details later
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Organization Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter organization name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Description (optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Description (max 64 characters)"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Configure token</h1>
                  <p className="text-muted-foreground mt-2">
                    Add the token address that will be associated with this
                    organization
                  </p>
                </div>
                <FormField
                  control={form.control}
                  disabled={form.formState.isSubmitting}
                  name="tokenAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Token Address</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. F7Hwf8ib5..."
                          onInput={(v) =>
                            debouncedTokenValidate(v.currentTarget.value)
                          }
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        This token will be used for organization operations
                      </FormDescription>
                      <div className="flex items-center gap-2">
                        {isPendingTokenInfo && (
                          <LoaderCircle className="animate-spin size-4" />
                        )}
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {!!tokenInfo?.success && (
                  <div className="mt-2">
                    <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg">
                      <Avatar className="w-8 h-8">
                        <AvatarImage
                          src={tokenInfo.success.logoURI}
                          alt={tokenInfo.success.name}
                          className="rounded-full"
                        />
                        <AvatarFallback className="text-xs">
                          {tokenInfo.success.symbol.slice(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex items-center gap-1">
                        <span className="font-medium">
                          {tokenInfo.success.name}
                        </span>
                        <span className="text-muted-foreground">
                          ({tokenInfo.success.symbol})
                        </span>
                      </div>
                    </div>
                    <div className="mt-6">
                      <FormField
                        control={form.control}
                        name="requiredTokenAmount"
                        disabled={form.formState.isSubmitting}
                        render={({ field }) => (
                          <FormItem className="w-full">
                            <FormLabel className="md:text-base">
                              Minimum token amount
                            </FormLabel>
                            <FormControl>
                              <Input {...field} />
                            </FormControl>

                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Configure Voting</h1>
                  <p className="text-muted-foreground mt-2">
                    Set up how voting and proposals will work in your
                    organization
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="votingApprovalThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voting Approval Threshold (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          placeholder="e.g. 60"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Percentage of votes needed for a proposal to pass
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="votingPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Voting Period (days)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={30}
                          placeholder="e.g. 7"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        How long proposals remain open for voting
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="quorumPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quorum Percentage (%)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min={1}
                          max={100}
                          placeholder="e.g. 60"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Minimum percentage of members that must vote for a
                        proposal to be valid
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* <FormField
                  control={form.control}
                  name="rolePromotionRequirement"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Role Promotion Requirements</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select requirement" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="majority">
                            Simple Majority (50%+)
                          </SelectItem>
                          <SelectItem value="supermajority">
                            Super Majority (66%+)
                          </SelectItem>
                          <SelectItem value="consensus">
                            Full Consensus (100%)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Voting threshold for promoting members to new roles
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                /> */}
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold">Review and confirm</h1>
                  <p className="text-muted-foreground mt-2">
                    One last look at the selected parameters before the
                    organization is created
                  </p>
                </div>
                <div className="space-y-4 bg-muted/50 rounded-lg p-4">
                  <div>
                    <h3 className="font-medium">Organization Name</h3>
                    <p className="text-muted-foreground">
                      {currentValues.name}
                    </p>
                  </div>
                  {currentValues.description && (
                    <div>
                      <h3 className="font-medium">Description</h3>
                      <p className="text-muted-foreground">
                        {currentValues.description}
                      </p>
                    </div>
                  )}
                  <div>
                    <h3 className="font-medium">Token Address</h3>
                    <p className="text-muted-foreground">
                      {currentValues.tokenAddress}
                    </p>
                  </div>
                  <div>
                    <h3 className="font-medium">Voting Configuration</h3>
                    <div className="space-y-2 mt-2">
                      <p className="text-muted-foreground">
                        Approval Threshold:{" "}
                        {currentValues.votingApprovalThreshold}%
                      </p>
                      <p className="text-muted-foreground">
                        Voting Period: {currentValues.votingPeriod} days
                      </p>
                      <p className="text-muted-foreground">
                        Quorum: {currentValues.quorumPercentage}%
                      </p>
                      {/* <p className="text-muted-foreground">
                        Role Promotion:{" "}
                        {currentValues.rolePromotionRequirement === "majority"
                          ? "Simple Majority"
                          : currentValues.rolePromotionRequirement ===
                            "supermajority"
                          ? "Super Majority"
                          : "Full Consensus"}
                      </p> */}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Deploy fee</h3>
                    <p className="text-muted-foreground">~0.015 SOL</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      This amount consists of 0.01 SOL one-time platform fee,
                      0.001 SOL which will be deposited into your
                      organization&apos;s account and ~0.004 SOL network rent.
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0 || isLoading}
              >
                {currentStep === 0 ? "Cancel" : "Back"}
              </Button>

              {!isLastStep ? (
                <Button type="button" onClick={nextStep}>
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
                    : "Confirm"}
                </LoaderButton>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
