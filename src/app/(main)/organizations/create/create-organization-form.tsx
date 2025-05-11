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
import { useTransactionStore } from "@/features/transaction-toast/use-transaction-store";
import { Skeleton } from "@/components/ui/skeleton";
import { WalletButton } from "@/components/wallet-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const WalletConnectionOverlay = () => {
  const walletModal = useWalletModal();

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center">
      <div className="bg-card p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-4">Connect Your Wallet</h2>
        <p className="text-muted-foreground mb-6">
          You need to connect your wallet to create an organization.
        </p>
        <div className="w-full flex justify-center">
          <WalletButton className="w-full" variant="default" />
        </div>
      </div>
    </div>
  );
};

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
  logoUrl: z.string().optional(),
  websiteUrl: z.string().optional(),
  twitterUrl: z.string().optional(),
  discordUrl: z.string().optional(),
  telegramUrl: z.string().optional(),
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
    id: "Create a Organization",
    name: "Create a Organization",
    fields: ["name", "description"],
  },
  {
    id: "Specify Token",
    name: "Specify Token",
    fields: ["tokenAddress", "requiredTokenAmount"],
  },
  {
    id: "Informations",
    name: "Informations",
    fields: [
      "logoUrl",
      "websiteUrl",
      "twitterUrl",
      "discordUrl",
      "telegramUrl",
    ],
  },
  {
    id: "Setup Voting",
    name: "Setup Voting",
    fields: [
      "votingApprovalThreshold",
      "votingPeriod",
      "quorumPercentage",
      // "rolePromotionRequirement",
    ],
  },
  {
    id: "Submit",
    name: "Submit",
    fields: [],
  },
];

export function CreateOrganizationForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { publicKey, signTransaction } = useWallet();
  const walletModal = useWalletModal();
  const {
    startTransaction,
    updateStep,
    setTxHash,
    updateStatus,
    addWarning,
    resetTransaction,
  } = useTransactionStore.getState();
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

  const requiredTokenAmount = form.getValues("requiredTokenAmount");
  const tokenAddress = form.getValues("tokenAddress");

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

  const requiredTokenBalance = useMemo(() => {
    if (!walletTokensData) {
      return 0;
    }
    const token = walletTokensData?.find(
      (token: any) => token.address === tokenAddress
    );
    if (!token) return 0;
    return formatTokenAmount(
      token?.tokenInfo.balance || 0,
      token?.tokenInfo.decimals
    );
  }, [walletTokensData, tokenAddress]);

  const hasRequiredTokens = useMemo(() => {
    if (!walletTokensData) {
      return false;
    }
    if (!requiredTokenAmount || !tokenAddress) return true;
    const token = walletTokensData?.find(
      (token: any) => token.address === tokenAddress
    );
    if (!token) return false;
    return (
      formatTokenAmount(token.tokenInfo.balance, token.tokenInfo.decimals) >=
      requiredTokenAmount
    );
  }, [walletTokensData, tokenAddress, requiredTokenAmount]);

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
      toast.dismiss();
      const transactionId = startTransaction(`Create organization`);

      updateStep(1, "loading", "Preparing transaction details...");
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
          logoUrl: data.logoUrl,
          websiteUrl: data.websiteUrl,
          twitterUrl: data.twitterUrl,
          discordUrl: data.discordUrl,
          telegramUrl: data.telegramUrl,
          description: data.description,
          // rolePromotionRequirement: data.rolePromotionRequirement,
        }
      );

      if (prepareCreateOrganizationResponse.error) {
        throw new Error(prepareCreateOrganizationResponse.error.message);
      }

      updateStep(1, "success");
      updateStep(2, "loading", "Please sign the transaction in your wallet");
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

      updateStep(2, "success");
      updateStep(3, "loading", "Submitting transaction to the network...");

      const createOrganizationResponse = await createOrganization(
        confirmTxPayload
      );

      updateStep(3, "success");
      updateStep(4, "loading", "Confirming deposit...");

      // console.log(createOrganizationResponse);
      if (createOrganizationResponse.error) {
        throw new Error(createOrganizationResponse.error.message);
      }
      updateStep(4, "success");
      updateStatus("success");
      router.push(
        `/organizations/${createOrganizationResponse.success.accountAddress}`
      );
    } catch (error) {
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

      if (!hasRequiredTokens) {
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
      {/* {!publicKey && <WalletConnectionOverlay />} */}
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

      <div className=" rounded-lg p-6">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {currentStep === 0 && (
              <div className="space-y-6">
                <div className="mb-16">
                  <h6 className="font-light text-muted-foreground">
                    {FORM_STEPS[currentStep]?.name}
                  </h6>
                  <p className="text-xl font-medium">
                    Take control and empower your community
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What&apos;s the name of your community?
                      </FormLabel>
                      <FormControl>
                        <Input placeholder="Web3 Workers" {...field} />
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
                          placeholder="Join a global network of unstoppable individuals pushing boundaries and building a better internet, one block at a time."
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
                <div className="mb-16">
                  <h1 className="font-light text-muted-foreground">
                    {FORM_STEPS[currentStep]?.name}
                  </h1>
                  <p className="text-xl font-medium">
                    The token mint address that will change the world
                  </p>
                </div>
                <FormField
                  control={form.control}
                  disabled={form.formState.isSubmitting}
                  name="tokenAddress"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What&apos;s the token mint address?</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="F7Hwf8ib5DVCoiuyGr618Y3gon429Rnd1r5F9R5upump"
                          onInput={(v) =>
                            debouncedTokenValidate(v.currentTarget.value)
                          }
                          {...field}
                        />
                      </FormControl>
                      <div className="flex flex-col w-1/2 gap-2">
                        {isPendingTokenInfo && (
                          <div className="mt-8">
                            <Skeleton className="w-100 h-4" />
                            <div className="flex flex-row gap-2">
                              <div className="inline-flex items-center gap-3 px-4 py-2 bg-muted/50 rounded-lg mt-2">
                                <Skeleton className="w-8 h-8 rounded-full" />
                                <Skeleton className="w-24 h-6 rounded-none" />
                              </div>
                              <div className="inline-flex items-center gap-3 px-4  rounded-lg mt-2 ms-2">
                                <Skeleton className="w-36 h-10 rounded-sm" />
                              </div>
                            </div>
                          </div>
                        )}

                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />

                {!!tokenInfo?.success && (
                  <div className="mt-2">
                    <span className="text-sm font-medium">
                      What&apos;s the minimum amount required to participate?
                    </span>
                    <div className="mt-2 flex flex-row gap-4">
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
                      <div className="">
                        <FormField
                          control={form.control}
                          name="requiredTokenAmount"
                          disabled={form.formState.isSubmitting}
                          render={({ field }) => (
                            <FormItem className="w-full py-1">
                              <FormControl>
                                <Input
                                  {...field}
                                  className="py-4 text-lg font-normal"
                                  placeholder="1000500"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    {!hasRequiredTokens && (
                      <div className="mt-4">
                        <Alert
                          variant={
                            hasRequiredTokens ? "default" : "destructive"
                          }
                        >
                          <AlertCircle className="h-4 w-4" />
                          <AlertDescription>
                            {hasRequiredTokens ? (
                              <span>
                                You have {tokenInfo.success.symbol} tokens in
                                your wallet
                              </span>
                            ) : (
                              <span>
                                You need {form.getValues("requiredTokenAmount")}{" "}
                                {tokenInfo.success.symbol} tokens, but you only
                                have {requiredTokenBalance}{" "}
                                {tokenInfo.success.symbol} in your wallet.
                              </span>
                            )}
                          </AlertDescription>
                        </Alert>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="mb-16">
                  <h1 className="font-light text-muted-foreground">
                    {FORM_STEPS[currentStep]?.name}
                  </h1>
                  <p className="text-xl font-medium">
                    Add your organization&apos;s social presence and branding
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="logoUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Logo URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://example.com/logo.png"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        A URL to your organization&apos;s logo image
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="websiteUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Website URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="twitterUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Twitter URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://twitter.com/yourorg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="discordUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Discord URL (optional)</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="https://discord.gg/yourorg"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="telegramUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telegram URL (optional)</FormLabel>
                      <FormControl>
                        <Input placeholder="https://t.me/yourorg" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="mb-16">
                  <h1 className="font-light text-muted-foreground">
                    {FORM_STEPS[currentStep]?.name}
                  </h1>
                  <p className="text-xl font-medium">
                    Set up how voting and proposals will work in your
                    organization
                  </p>
                </div>
                <FormField
                  control={form.control}
                  name="votingApprovalThreshold"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What percentage of votes are needed to pass a proposal?
                      </FormLabel>
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
                  name="votingPeriod"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How long will the voting period be?</FormLabel>
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

                <FormField
                  control={form.control}
                  name="quorumPercentage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        What&apos;s the minimum percentage of members that must
                        vote for a proposal to be valid?
                      </FormLabel>
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
              </div>
            )}

            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="mb-16">
                  <h1 className="font-light text-muted-foreground">
                    {FORM_STEPS[currentStep]?.name}
                  </h1>
                  <p className="text-xl font-medium">
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
                    <h3 className="font-medium">Social Links</h3>
                    <div className="space-y-2 mt-2">
                      {currentValues.logoUrl && (
                        <p className="text-muted-foreground">
                          Logo: {currentValues.logoUrl}
                        </p>
                      )}
                      {currentValues.websiteUrl && (
                        <p className="text-muted-foreground">
                          Website: {currentValues.websiteUrl}
                        </p>
                      )}
                      {currentValues.twitterUrl && (
                        <p className="text-muted-foreground">
                          Twitter: {currentValues.twitterUrl}
                        </p>
                      )}
                      {currentValues.discordUrl && (
                        <p className="text-muted-foreground">
                          Discord: {currentValues.discordUrl}
                        </p>
                      )}
                      {currentValues.telegramUrl && (
                        <p className="text-muted-foreground">
                          Telegram: {currentValues.telegramUrl}
                        </p>
                      )}
                    </div>
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
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">Deployment fee</h3>
                    <p className="text-muted-foreground">~0.015 SOL</p>
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
                    : "Confirm & Create"}
                </LoaderButton>
              )}
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
