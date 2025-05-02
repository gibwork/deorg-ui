"use client";

import { Fragment, useState, useMemo, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  BadgeCheck,
  CalendarIcon,
  ChevronDown,
  ChevronRight,
  CircleHelp,
  CircleX,
  LoaderCircle,
  Wallet,
} from "lucide-react";
import { Transaction } from "@solana/web3.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, SubmitHandler } from "react-hook-form";
import { motion } from "framer-motion";

import { cn, getSupportedTokens } from "@/lib/utils";
import { format } from "date-fns";
import dayjs from "dayjs";
import { TimePicker12Demo } from "@/components/time-picker/time-picker-12hour-demo";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  confirmTaskDepositTransaction,
  Deposit,
  depositToken,
} from "@/actions/post/create-task";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CreateTaskFormDataScheme,
  CreateTaskFormDataType,
} from "../schema/create-task-schema";
import { useWallet } from "@solana/wallet-adapter-react";
import { TagsSelect } from "@/components/tags-select";
import TiptapEditor from "@/components/tiptap/tiptap-editor";
import { Icons } from "@/components/icons";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
import useNetwork from "@/hooks/use-network";
import { toast } from "sonner";
import { formatTokenAmount } from "@/utils/format-amount";
import SelectTokenModal from "@/components/modals/select-token-modal";
import { useWalletTokenBalances } from "@/hooks/use-wallet-token-balances";
import { usePlatformFee } from "../lib/use-platform-fee";
import { Skeleton } from "@/components/ui/skeleton";
import { useWalletModal } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { LoaderButton } from "@/components/loader-button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { User } from "@/types/user.types";
import { useAuth } from "@clerk/nextjs";
import { TeleSwapFormData } from "@/types/teleswap.types";
import TeleswapDepositForm from "./teleswap-deposit-form";
import { TeleswapWarningModal } from "../components/teleswap-warning-modal";
import { useReferralStore } from "@/features/referral/lib/use-referral-store";
import SelectNFTCollectionModal, {
  type NFTCollection,
} from "../components/select-nft-collection-modal";
import { getTokenInfo } from "../actions/get-token-info";
import { useDebounceCallback } from "usehooks-ts";
import { Badge } from "@/components/ui/badge";
import { confirmBountyDepositTransaction } from "@/actions/post/create-bounty";
import { TaskType } from "@/constants/data";
import { tasksCategories, openSourceTags } from "@/constants/data";
import { validateGithubIssue } from "../actions/validate-github-issue";
interface TokenMetadata {
  symbol: string;
  imgUrl: string;
  mintAddress: string;
  decimals: number;
}

interface PaymentDetails {
  amount: number;
  symbol: string;
  imgURL: string;
  mintAddress: string;
}

const GENERAL_TASK_STEPS = [
  {
    id: "Step 1",
    name: "Overview",
    fields: ["title", "content", "tags", "deadline"],
  },
  {
    id: "Step 2",
    name: "Requirements",
    fields: [
      "requirements",
      "allowOnlyNftCollectionHolderSubmissions",
      "isNFTRequired",
      "requiredNFTCollectionId",
      "isTokenRequired",
      "requiredTokenAddress",
      "requiredTokenAmount",
    ],
  },
  {
    id: "Step 3",
    name: "Additional Options",
    fields: ["isPrivate"],
  },
  {
    id: "Step 4",
    name: "Deposit & Publish",
    fields: ["amount"],
  },
];

const GITHUB_TASK_STEPS = [
  {
    id: "Step 1",
    name: "Overview",
    fields: ["title", "content", "deadline"],
  },
  {
    id: "Step 2",
    name: "Requirements",
    fields: ["externalUrl", "ghBranch", "tags", "requirements"],
  },
  {
    id: "Step 3",
    name: "Additional Options",
    fields: ["isPrivate"],
  },
  {
    id: "Step 4",
    name: "Deposit & Publish",
    fields: ["amount"],
  },
];

export default function CreateTaskForm() {
  const queryClient = useQueryClient();
  const { userId } = useAuth();
  const { publicKey, signTransaction } = useWallet();
  const walletModal = useWalletModal();
  const router = useRouter();
  const transaction = useTransactionStatus();
  const network = useNetwork((state) => state.network);
  const {
    selectedPriority,
    maxPriorityFee,
    exactPriorityFee,
    isPriorityFeeModeMaxCap,
  } = usePriorityFeeLevelStore();
  const [paymentType, setPaymentType] = useState("");
  const [taskType, setTaskType] = useState<TaskType>(TaskType.General);
  const [previousStep, setPreviousStep] = useState<number>(0);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const referralCode = useReferralStore((state) => state.referralCode);
  const clearReferral = useReferralStore((state) => state.clearReferral);

  const [selectedNftCollection, setSelectedNftCollection] = useState<
    NFTCollection | undefined
  >();
  const [teleswapFormData, setTeleswapFormData] = useState<TeleSwapFormData>({
    depositAmount: 0,
    taskId: null,
    depositQuote: null,
    depositAddress: null,
    status: "NONE",
  });

  const tokenMetadata: TokenMetadata[] = getSupportedTokens();
  const usdcTokenMetadata = tokenMetadata.find((w) => w.symbol == "SOL");
  const [paymentDetails, setPaymentDetails] = useState<PaymentDetails>({
    amount: 0,
    symbol: "SOL",
    imgURL: usdcTokenMetadata?.imgUrl!,
    mintAddress: usdcTokenMetadata?.mintAddress!,
  });

  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);
  const [isNFTModalOpen, setIsNFTModalOpen] = useState(false);
  const [isTeleswapWarningModalOpen, setIsTeleswapWarningModalOpen] =
    useState(false);

  const userData = queryClient.getQueryData<User>([`user-${userId}`]);
  const {
    data: walletTokensData,
    error,
    isLoading: walletTokensLoading,
    refetch,
    isRefetching: isWalletTokensRefetching,
  } = useWalletTokenBalances({
    enabled: !!userData && !!userData?.primaryWallet,
  });

  const selectedToken = useMemo(() => {
    if (walletTokensData) {
      const token = walletTokensData.find(
        (token: any) => token.address == paymentDetails?.mintAddress
      );

      if (!token) {
        return {
          ...paymentDetails,
          amount: 0,
        };
      }
      return {
        ...paymentDetails,
        amount: formatTokenAmount(
          token.tokenInfo.balance,
          token.tokenInfo.decimals
        ),
      };
    }
    return {
      ...paymentDetails,
      amount: 0,
    };
  }, [paymentDetails, walletTokensData]);

  const delta = currentStep - previousStep;
  const form = useForm<CreateTaskFormDataType>({
    resolver: zodResolver(CreateTaskFormDataScheme),
    mode: "onChange",
    defaultValues: {
      deadline: dayjs().add(1, "day").toDate(),
    },
  });

  const depositAmount = form.getValues("amount");
  const allowOnlyNftCollectionHolderSubmissions = form.watch("isNFTRequired");
  const allowOnlyTokenHolderSubmissions = form.watch("isTokenRequired");

  const {
    tokenPrice: selectedTokenPrice,
    platformFee,
    error: platformFeeError,
    isLoading: isPlatformFeeLoading,
    calculatePlatformFee,
  } = usePlatformFee({
    selectedTokenAddress: selectedToken?.mintAddress,
    depositAmount,
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
    },
    onError: (error) => {
      form.setError("requiredTokenAddress", {
        message: "Invalid token address",
      });
    },
  });

  const {
    mutate: validateGithubIssueFn,
    isPending: isValidatingGithub,
    error: githubValidationError,
    data: githubIssueData,
  } = useMutation({
    mutationFn: validateGithubIssue,
    onSuccess: (data) => {
      if (data.error) {
        if (data.type === "issue") {
          form.setError("externalUrl", {
            type: "manual",
            message: data.error,
          });
        } else if (data.type === "branch") {
          form.setError("ghBranch", {
            type: "manual",
            message: data.error,
          });
        }
        return;
      }

      form.clearErrors(["externalUrl", "ghBranch"]);
    },
    onError: (error) => {
      form.setError("externalUrl", {
        message:
          error instanceof Error ? error.message : "Invalid GitHub issue URL",
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

  const isValidDeposit = useMemo(() => {
    if (!depositAmount || !selectedToken) return false;

    const hasInsufficientToken = depositAmount > selectedToken.amount;
    const hasInsufficientSol =
      selectedToken.symbol === "SOL" && depositAmount >= selectedToken.amount;
    const hasInsufficientFees =
      solBalance <
      (platformFee ?? 0) +
        (isPriorityFeeModeMaxCap ? maxPriorityFee : exactPriorityFee);

    return !hasInsufficientToken && !hasInsufficientSol && !hasInsufficientFees;
  }, [
    depositAmount,
    selectedToken,
    solBalance,
    platformFee,
    isPriorityFeeModeMaxCap,
    maxPriorityFee,
    exactPriorityFee,
  ]);

  async function processTaskPayment(data: CreateTaskFormDataType) {
    if (!publicKey || !signTransaction || !paymentDetails) return;

    const depositPayload: Deposit = {
      payer: publicKey.toString(),
      strategy: "blockhash",
      token: {
        mintAddress: paymentDetails.mintAddress!,
        amount: Number(depositAmount!),
      },
      network,
      priorityFeeLevel: selectedPriority,
      maxPriorityFee: isPriorityFeeModeMaxCap ? maxPriorityFee : null,
      priorityFee: !isPriorityFeeModeMaxCap ? exactPriorityFee : null,
      workType: "Task",
      referral: referralCode ?? null,
    };
    console.log(depositPayload);

    // const depositCreateResponse = await depositToken(depositPayload);

    // if (depositCreateResponse.error) {
    //   if (depositCreateResponse.error.statusCode === 400) {
    //     form.setError("amount", {
    //       message: depositCreateResponse.error.message,
    //     });
    //   }
    //   throw new Error(depositCreateResponse.error.message);
    // }
    // const retreivedTx = Transaction.from(
    //   Buffer.from(depositCreateResponse.success.serializedTransaction, "base64")
    // );

    // const serializedTx = await signTransaction(retreivedTx);

    // const requiredTokenData = data.isTokenRequired
    //   ? {
    //       mintAddress: data.requiredTokenAddress!,
    //       symbol: tokenInfo?.success?.symbol!,
    //       imageUrl: tokenInfo?.success?.logoURI!,
    //       amount: data.requiredTokenAmount!,
    //     }
    //   : null;

    const confirmTxPayload = {
      transactionId: "depositCreateResponse.success.transactionId",
      serializedTransaction: "serializedTx?.serialize().toString('base64')",
      content: data.content,
      requirements: data.requirements,
      tags: data.tags,
      title: data.title,
      isHidden: data.isPrivate,
      isFeatured: data.isFeatured,
      deadline: data.deadline,
      isBlinksEnabled: data.isBlinksEnabled,
      nftCollectionId: data.requiredNFTCollectionId,
      allowOnlyVerifiedSubmissions: data.allowOnlyVerifiedSubmissions,
      referral: referralCode ?? null,
      token: null,
    };

    const transactionResponse = await confirmTaskDepositTransaction(
      confirmTxPayload
    );

    if (transactionResponse.error) {
      throw new Error(transactionResponse.error.message);
    } else {
      return transactionResponse;
    }
  }

  async function processGithubTaskPayment(data: CreateTaskFormDataType) {
    if (!publicKey || !signTransaction || !paymentDetails) return;

    const depositPayload: Deposit = {
      payer: publicKey.toString(),
      strategy: "blockhash",
      token: {
        mintAddress: paymentDetails.mintAddress,
        amount: Number(data.amount!),
      },
      network,
      priorityFeeLevel: selectedPriority,
      maxPriorityFee: isPriorityFeeModeMaxCap ? maxPriorityFee : null,
      priorityFee: !isPriorityFeeModeMaxCap ? exactPriorityFee : null,
      workType: "Bounty",
      referral: referralCode ?? null,
    };

    // const depositCreateResponse = await depositToken(depositPayload);

    // if (depositCreateResponse.error) {
    //   if (depositCreateResponse.error.statusCode === 400) {
    //     form.setError("amount", { message: "Minimum amount not met" });
    //   }
    //   throw new Error(depositCreateResponse.error.message);
    // }
    // const retreivedTx = Transaction.from(
    //   Buffer.from(depositCreateResponse.success.serializedTransaction, "base64")
    // );

    // const serializedTx = await signTransaction(retreivedTx);

    const confirmTxPayload = {
      transactionId: "depositCreateResponse.success.transactionId",
      serializedTransaction: "serializedTx?.serialize().toString('base64')",
      externalUrl: data.externalUrl!,
      title: data.title,
      overview: data.content,
      requirements: data.requirements,
      ghBranch: data.ghBranch,
      tags: data.tags,
      deadline: data.deadline,
      referral: referralCode ?? null,
      isHidden: data.isPrivate,
      allowOnlyVerifiedSubmissions: data.allowOnlyVerifiedSubmissions,
    };

    const transactionResponse = await confirmBountyDepositTransaction(
      confirmTxPayload
    );

    if (transactionResponse.error) {
      throw new Error(transactionResponse.error.message);
    } else {
      return transactionResponse;
    }
  }

  async function pay(data: CreateTaskFormDataType) {
    if (taskType === TaskType.Github) {
      return await processGithubTaskPayment(data);
    } else if (taskType === TaskType.General) {
      return await processTaskPayment(data);
    } else {
      throw new Error("Invalid Task Type!");
    }
  }

  const processForm: SubmitHandler<CreateTaskFormDataType> = async (data) => {
    if (platformFeeError) {
      return form.setError("amount", { message: platformFeeError });
    }

    try {
      // Add loading state
      transaction.onStart();

      const taskResponse = await pay(data);

      if (!taskResponse?.success) {
        throw new Error("Failed to create task");
      }

      clearReferral();

      await queryClient.invalidateQueries({
        queryKey: ["userTokenList"],
      });

      toast.success("Task posted successfully!");

      // Improve routing logic
      const routes = {
        [TaskType.General]: `/tasks/${taskResponse.success.id}?share=true`,
        [TaskType.Github]: `/bounties/${taskResponse.success.id}?share=true`,
      };

      router.push(routes[taskType] ?? "/tasks");
    } catch (error) {
      toast.error("Failed to create task", {
        description:
          error instanceof Error ? error.message : "Please try again later",
      });
    } finally {
      transaction.onEnd();
    }
  };

  type FieldName = keyof CreateTaskFormDataType;

  const steps = useMemo(
    () =>
      taskType === TaskType.Github ? GITHUB_TASK_STEPS : GENERAL_TASK_STEPS,
    [taskType]
  );

  const next = async () => {
    // Perform validation for all fields up to and including the current step
    const fieldsToValidate = steps
      .slice(0, currentStep + 1)
      .flatMap((step) => step.fields);

    if (taskType === TaskType.Github) {
      if (fieldsToValidate.includes("ghBranch")) {
        if (!form.getValues("ghBranch")) {
          form.setError("ghBranch", {
            type: "manual",
            message: "Please enter a github branch.",
          });
          return;
        }

        if (fieldsToValidate.includes("externalUrl")) {
          if (
            form.formState.errors.externalUrl ||
            form.formState.errors.ghBranch
          ) {
            return;
          }
          if (!form.getValues("externalUrl")) {
            form.setError("externalUrl", {
              type: "manual",
              message: "Please enter a github issue url.",
            });
            return;
          }
          if (!githubIssueData?.success) {
            return;
          }
        }
      }
    }

    const output = await form.trigger(fieldsToValidate as FieldName[], {
      shouldFocus: true,
    });

    if (!output) return;

    // Additional custom validation for NFT requirement
    const isNFTRequired = form.getValues("isNFTRequired");
    const isTokenRequired = form.getValues("isTokenRequired");

    if (isNFTRequired && !form.getValues("requiredNFTCollectionId")) {
      form.setError("requiredNFTCollectionId", {
        type: "manual",
        message: "Please select an NFT Collection to continue.",
      });
      return;
    }

    if (isTokenRequired) {
      if (!form.getValues("requiredTokenAddress")) {
        form.setError("requiredTokenAddress", {
          type: "manual",
          message:
            "Token address must be provided if 'Token Required' is enabled.",
        });
        return;
      } else if (getTokenInfoError) {
        form.setError("requiredTokenAddress", {
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

    if (currentStep < steps.length) {
      if (currentStep === steps.length - 1) {
        await form.handleSubmit(processForm)();
      }
      setPreviousStep(currentStep);
      setCurrentStep((step) => step + 1);
    }
  };

  const prev = () => {
    if (
      currentStep === 3 &&
      teleswapFormData.status === "WAITING_RECEIVE_FUNDS"
    ) {
      setIsTeleswapWarningModalOpen(true);
    } else if (currentStep > 0) {
      resetTeleswapFormData();
      setPreviousStep(currentStep);
      setCurrentStep((step) => step - 1);
    }
  };

  const resetTeleswapFormData = useCallback(() => {
    transaction.onEnd();
    setTeleswapFormData({
      depositAmount: 0,
      taskId: null,
      depositQuote: null,
      depositAddress: null,
      status: "NONE",
    });
  }, [transaction]);

  const handleTaskTypeChange = (type: TaskType) => {
    setTaskType(type);
  };

  const handlePaymentMethodChange = useCallback(
    (value: string) => {
      if (
        !isTeleswapWarningModalOpen &&
        value === "wallet" &&
        teleswapFormData.status === "WAITING_RECEIVE_FUNDS"
      ) {
        return setIsTeleswapWarningModalOpen(true);
      }
      resetTeleswapFormData();
      setPaymentType(value);
    },
    [isTeleswapWarningModalOpen, teleswapFormData.status, resetTeleswapFormData]
  );

  const handleChangePaymentToWallet = () => {
    resetTeleswapFormData();
    setPaymentType("wallet");
    setIsTeleswapWarningModalOpen(false);
  };

  const handleBackWarningModal = () => {
    resetTeleswapFormData();
    setIsTeleswapWarningModalOpen(false);
    setPreviousStep(currentStep);
    setCurrentStep((step) => step - 1);
  };

  const debouncedGithubValidation = useDebounceCallback(
    (url: string, branch: string) => {
      if (!url || !branch) return;
      validateGithubIssueFn({ url, branch });
    },
    500
  );

  const debouncedTokenValidate = useDebounceCallback((tokenAddress: string) => {
    if (!tokenAddress) return;
    getTokenInfoFn(tokenAddress);
  }, 500);

  useEffect(() => {
    if (!allowOnlyNftCollectionHolderSubmissions) {
      setSelectedNftCollection(undefined);
      form.setValue("requiredNFTCollectionId", undefined);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowOnlyNftCollectionHolderSubmissions]);

  useEffect(() => {
    if (!allowOnlyTokenHolderSubmissions) {
      form.setValue("requiredTokenAddress", undefined);
      resetTokenInfo();
      form.setValue("requiredTokenAmount", 1);
      form.trigger(["requiredTokenAddress", "requiredTokenAmount"]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allowOnlyTokenHolderSubmissions]);

  if (!steps || steps.length === 0) return <></>;

  return (
    <>
      <SelectTokenModal
        isOpen={isTokenModalOpen}
        setIsOpen={setIsTokenModalOpen}
        title="Select Token"
        description="Select the token you want to pay with"
        setPaymentDetails={setPaymentDetails}
      />
      <TeleswapWarningModal
        isOpen={isTeleswapWarningModalOpen}
        onClose={setIsTeleswapWarningModalOpen}
        onConfirm={
          paymentType === "wallet"
            ? handleBackWarningModal
            : handleChangePaymentToWallet
        }
        status={teleswapFormData.status}
        paymentMethod={paymentType}
      />
      <div className=" supports-backdrop-blur:bg-background/60  bg-background/95 backdrop-blur  z-50  text-black dark:text-white shadow-sm dark:shadow-zinc-800">
        <div className=" py-4 w-full max-w-3xl mx-auto flex flex-wrap justify-center gap-2 items-center   ">
          {steps.map((step, index) => (
            <Fragment key={index + "tab"}>
              <button
                // onClick={() => {
                //   if (currentStep >= index) {
                //     setCurrentStep(index);
                //   }
                // }}
                className="flex items-center gap-2 font-semibold"
              >
                <div
                  className={cn(
                    "flex items-center justify-center rounded-full size-6 text-sm transition-all",
                    currentStep >= index
                      ? "bg-theme text-primary-foreground"
                      : "bg-muted text-muted-foreground"
                  )}
                >
                  {index + 1}
                </div>
                <p
                  className={cn(
                    "text-sm text-foreground transition-all",
                    currentStep >= index
                      ? "text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.name}
                </p>
              </button>

              {index !== steps.length - 1 && (
                <ChevronRight className="size-4" />
              )}
            </Fragment>
          ))}
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(processForm)} className="">
          <div className=" w-full max-w-4xl mx-auto  px-4 pt-4 md:pt-8 py-16  sm:px-6 grid gap-6 ">
            {steps && currentStep === 0 && (
              <div
              // initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
              // animate={{ x: 0, opacity: 1 }}
              // transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Card className="flex flex-col gap-6 md:gap-8 p-0 sm:p-6 sm:border border-0 sm:shadow-sm shadow-none">
                  <div>
                    <h1 className="font-semibold text-lg sm:text-xl">
                      Task Overview
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Basic information about the task you are about to create.
                    </p>
                  </div>

                  <FormField
                    control={form.control}
                    name="title"
                    disabled={form.formState.isSubmitting}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="md:text-base">Title</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter a title" {...field} />
                        </FormControl>

                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="content"
                    render={({ field }) => (
                      <FormItem className="">
                        <FormLabel className="md:text-base">Overview</FormLabel>
                        <FormDescription>
                          Describe the task in detail; the purpose here is for
                          users to understand what the job/task entails. Save
                          the requirements for the next section.
                        </FormDescription>
                        <FormControl
                          aria-disabled={form.formState.isSubmitting}
                        >
                          <TiptapEditor
                            content={field.value}
                            onChange={field.onChange}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="flex gap-2">
                    <div className=" flex flex-col">
                      <div className="mb-4">
                        <h4 className="font-semibold">Task Type</h4>
                        <p className="text-sm text-muted-foreground">
                          {" "}
                          Select the type of task you want to create
                        </p>
                      </div>
                      <RadioGroup
                        onValueChange={handleTaskTypeChange}
                        value={taskType}
                        disabled={
                          form.formState.isSubmitting ||
                          transaction.isProcessing
                        }
                      >
                        <Label htmlFor="general" className="text-[1.1rem]">
                          <div className="border rounded-md p-3 hover:bg-accent cursor-pointer">
                            <div className="flex flex-col">
                              <div className="flex">
                                <RadioGroupItem
                                  value={TaskType.General}
                                  id="general"
                                  className="mt-1.5 me-2 h-3 w-3"
                                />
                                <span className=" font-semibold">
                                  General Task
                                </span>
                              </div>
                              <div className="flex text-sm text-muted-foreground font-normal">
                                If you want to process payments for work
                                completed after your approval.
                              </div>
                            </div>
                          </div>
                        </Label>

                        <Label htmlFor="github">
                          <div className="border rounded-md p-3 hover:bg-accent cursor-pointer">
                            <div className="items-start gap-2">
                              <div className="flex flex-col ">
                                <div className="flex justify-between">
                                  <div>
                                    <RadioGroupItem
                                      value={TaskType.Github}
                                      id="github"
                                      className="mt-1.5 me-2 h-3 w-3"
                                    />
                                    <span className="text-[1.1rem] font-semibold">
                                      Github Task
                                    </span>
                                  </div>
                                  <Badge className=" ms-4 text-end opacity-100 font-[400] text-xs mb-1 align-middle rounded-sm me-1 py-1 px-2">
                                    Requires Githbub Account{" "}
                                  </Badge>
                                </div>
                              </div>
                              <div className="flex">
                                <div className="flex text-sm text-muted-foreground font-normal">
                                  Contributor will submit a Pull Request via
                                  Gibwork. On Pull request merge, contributor
                                  will be paid instantly.
                                </div>
                              </div>
                            </div>
                          </div>
                        </Label>
                      </RadioGroup>
                    </div>
                  </div>

                  {taskType === TaskType.General && (
                    <FormField
                      control={form.control}
                      name="tags"
                      disabled={form.formState.isSubmitting}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="md:text-base">
                            Category
                          </FormLabel>

                          <FormDescription>
                            Select a Category to describe what your task is
                            about.{" "}
                          </FormDescription>
                          <FormControl>
                            <TagsSelect
                              title="Category"
                              disabled={form.formState.isSubmitting}
                              tags={field.value}
                              availableTags={tasksCategories}
                              maxSelectedAllowed={1}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  )}

                  <FormField
                    control={form.control}
                    name="deadline"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel className="text-left text-base">
                          Deadline
                        </FormLabel>
                        <FormDescription className="">
                          This is the date by which the task ends at.
                        </FormDescription>
                        <Popover>
                          <FormControl>
                            <PopoverTrigger asChild>
                              <Button
                                variant="outline"
                                className={cn(
                                  "w-[280px] justify-start text-left font-normal",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                <CalendarIcon className="mr-2 h-4 w-4" />

                                {/* fix the following */}

                                {field.value ? (
                                  format(field.value, "PPP HH:mm:ss")
                                ) : (
                                  <span>Pick a date</span>
                                )}
                              </Button>
                            </PopoverTrigger>
                          </FormControl>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              fromDate={dayjs().add(1, "day").toDate()}
                              toDate={dayjs("2025-12-31").toDate()}
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                            <div className="p-3 border-t border-border">
                              {/* <TimePickerDemo
                      setDate={field.onChange}
                      date={field.value}
                    /> */}
                              <TimePicker12Demo
                                setDate={field.onChange}
                                date={field.value}
                              />
                            </div>
                          </PopoverContent>
                        </Popover>
                      </FormItem>
                    )}
                  />
                </Card>
              </div>
            )}

            {currentStep === 1 && (
              <>
                {taskType === TaskType.General && (
                  <motion.div
                    initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="flex flex-col gap-6 p-0 sm:p-6 sm:border border-0 sm:shadow-sm shadow-none">
                      <div>
                        <h1 className="font-semibold text-lg sm:text-xl">
                          Submission Requirements
                        </h1>
                        <p className="text-muted-foreground text-sm">
                          The requirements that a user must meet to be
                          considered for payment.
                        </p>
                      </div>

                      <FormField
                        control={form.control}
                        name="requirements"
                        render={({ field }) => (
                          <FormItem className="">
                            <FormLabel className="md:text-base">
                              Guidelines
                            </FormLabel>
                            <FormDescription>
                              Provide a detailed explanation of what the
                              submission should include.
                            </FormDescription>
                            <FormControl
                              aria-disabled={form.formState.isSubmitting}
                            >
                              <TiptapEditor
                                content={field.value}
                                onChange={field.onChange}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="allowOnlyVerifiedSubmissions"
                        disabled={form.formState.isSubmitting}
                        render={({ field }) => (
                          <FormItem className="flex sm:flex-row flex-col justify-between gap-2 sm:items-center">
                            <div className="space-y-0.5">
                              <FormLabel className="md:text-base">
                                Verified only
                              </FormLabel>
                              <FormDescription>
                                Accept submissions from verified users only.
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                disabled={form.formState.isSubmitting}
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="isTokenRequired"
                        disabled={form.formState.isSubmitting}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex sm:flex-row flex-col justify-between gap-2 sm:items-center">
                              <div className="space-y-0.5">
                                <FormLabel className="md:text-base">
                                  Restrict to Token Holders
                                </FormLabel>
                                <FormDescription>
                                  Set a token and the minimum amount users must
                                  hold to be eligible for this task.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  disabled={form.formState.isSubmitting}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!!allowOnlyTokenHolderSubmissions && (
                        <div className="">
                          <div className="flex gap-4 items-end w-full justify-between">
                            <FormField
                              control={form.control}
                              name="requiredTokenAddress"
                              disabled={form.formState.isSubmitting}
                              render={({ field }) => (
                                <FormItem className="w-full">
                                  <FormLabel className="md:text-base">
                                    Token address
                                  </FormLabel>
                                  <FormControl>
                                    <Input
                                      placeholder="e.g. F7Hwf8ib5..."
                                      onInput={(v) =>
                                        debouncedTokenValidate(
                                          v.currentTarget.value
                                        )
                                      }
                                      {...field}
                                    />
                                  </FormControl>

                                  <div className="flex items-center gap-2">
                                    {isPendingTokenInfo && (
                                      <LoaderCircle className="animate-spin size-4" />
                                    )}
                                    <FormMessage />
                                  </div>
                                </FormItem>
                              )}
                            />
                          </div>

                          {!!tokenInfo?.success && (
                            <>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
                                <div className="w-full flex flex-col bg-secondary rounded-md p-4">
                                  <span className="text-sm">Token name</span>
                                  <div className="mt-3 flex gap-2 items-center">
                                    <Avatar className="w-8 h-8">
                                      <AvatarImage
                                        src={tokenInfo.success.logoURI}
                                        alt={tokenInfo.success.name}
                                        className="rounded-full"
                                      />

                                      <AvatarFallback />
                                    </Avatar>
                                    <span className="text-lg">
                                      {tokenInfo.success.name}
                                    </span>
                                  </div>
                                </div>
                                <div className="w-full flex flex-col bg-secondary rounded-md p-4">
                                  <span className="text-sm">Token symbol</span>
                                  <div className="flex gap-1 mt-3">
                                    <span className="text-primary/50">$</span>
                                    <span className="text-lg">
                                      {tokenInfo.success.symbol}
                                    </span>
                                  </div>
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
                            </>
                          )}
                        </div>
                      )}

                      <FormField
                        control={form.control}
                        name="isNFTRequired"
                        disabled={form.formState.isSubmitting}
                        render={({ field }) => (
                          <FormItem>
                            <div className="flex sm:flex-row flex-col justify-between gap-2 sm:items-center">
                              <div className="space-y-0.5">
                                <FormLabel className="md:text-base">
                                  Restrict to NFT Holders
                                </FormLabel>
                                <FormDescription>
                                  Restrict task access to users who hold NFT(s)
                                  from a selected collection.
                                </FormDescription>
                              </div>
                              <FormControl>
                                <Switch
                                  disabled={form.formState.isSubmitting}
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                            </div>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      {!!allowOnlyNftCollectionHolderSubmissions &&
                        !!selectedNftCollection && (
                          <div className="flex items-center gap-2">
                            <Avatar className="w-7 h-7 ">
                              <AvatarImage
                                src={selectedNftCollection?.imageUrl}
                                alt={selectedNftCollection?.name}
                              />
                              <AvatarFallback className="bg-muted" />
                            </Avatar>
                            <p className="flex flex-col">
                              <span className="flex items-center gap-2">
                                {selectedNftCollection?.symbol ??
                                  "Unknown Token"}
                              </span>
                              <span className="flex gap-0.5 items-center text-xs text-muted-foreground">
                                {selectedNftCollection?.name ??
                                  "Metadata not found"}
                                {selectedNftCollection?.isVerified && (
                                  <BadgeCheck className="text-primary-foreground size-3.5 fill-theme" />
                                )}
                              </span>
                            </p>
                          </div>
                        )}

                      <SelectNFTCollectionModal
                        isOpen={!!allowOnlyNftCollectionHolderSubmissions}
                        onSelectCollection={(collection) => {
                          form.setValue(
                            "requiredNFTCollectionId",
                            collection.id
                          );
                          form.trigger("requiredNFTCollectionId");
                          setSelectedNftCollection(collection);
                          setIsNFTModalOpen(false);
                        }}
                      />

                      {form.formState.errors.requiredNFTCollectionId && (
                        <span className=" text-destructive">
                          {
                            form.formState.errors.requiredNFTCollectionId
                              .message
                          }
                        </span>
                      )}
                    </Card>{" "}
                  </motion.div>
                )}

                {taskType === TaskType.Github && (
                  <motion.div
                    initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    <Card className="flex flex-col p-0 sm:p-6 sm:border border-0 sm:shadow-sm shadow-none">
                      <div className="mb-6">
                        <h1 className="font-semibold text-lg sm:text-xl">
                          Submission Requirements
                        </h1>
                        <span className="text-sm text-muted-foreground">
                          The requirements that a user must meet to be
                          considered for payment.
                        </span>
                      </div>
                      <div>
                        <span className="text-base font-medium">
                          Github Issue URL
                        </span>
                        <p className="text-sm text-muted-foreground mb-2">
                          Paste the URL of the Github Issue describing the work
                          that neds to be completed.
                        </p>
                        <FormField
                          control={form.control}
                          name="externalUrl"
                          disabled={form.formState.isSubmitting}
                          render={({ field }) => (
                            <FormItem>
                              <FormControl>
                                <div className="relative">
                                  <Input
                                    className="block w-full h-10 rounded-md px-3 py-1.5 text-base outline outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6 bg-inherit placeholder:opacity-50 pr-10"
                                    placeholder="https://github.com/anza-xyz/wallet-adapter/issues/1045"
                                    {...field}
                                    onChange={(e) => {
                                      field.onChange(e);
                                      const branch = form.getValues("ghBranch");
                                      if (branch) {
                                        debouncedGithubValidation(
                                          e.target.value,
                                          branch
                                        );
                                      }
                                    }}
                                    autoComplete="off"
                                    autoFocus
                                  />
                                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    {isValidatingGithub ? (
                                      <LoaderCircle className="animate-spin size-4" />
                                    ) : githubIssueData?.success ? (
                                      <BadgeCheck className="size-4 text-green-500" />
                                    ) : form.formState.errors.externalUrl ? (
                                      <CircleX className="size-4 text-destructive" />
                                    ) : null}
                                  </div>
                                </div>
                              </FormControl>

                              <div className="flex items-center gap-2 min-h-[20px]">
                                {!isValidatingGithub &&
                                  githubIssueData?.success &&
                                  !form.formState.errors.externalUrl && (
                                    <span className="text-xs text-green-500">
                                      Valid GitHub issue
                                    </span>
                                  )}
                                <FormMessage />
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>

                      <div className="flex flex-col sm:flex-row gap-4 mt-6 sm:p-2">
                        <div>
                          <span className="text-base font-medium">Branch</span>
                          <p className="text-sm text-muted-foreground mb-2">
                            The branch where the pull request should be made to.
                          </p>
                          <FormField
                            control={form.control}
                            name="ghBranch"
                            disabled={form.formState.isSubmitting}
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <div className="relative">
                                    <Input
                                      className="w-full block h-10 rounded-md px-3 py-1.5 text-base outline outline-1 -outline-offset-1 outline-gray-300 sm:text-sm/6 bg-inherit placeholder:opacity-50 pr-10"
                                      placeholder="main"
                                      autoComplete="off"
                                      {...field}
                                      onChange={(e) => {
                                        field.onChange(e);
                                        const url =
                                          form.getValues("externalUrl");
                                        if (url) {
                                          debouncedGithubValidation(
                                            url,
                                            e.target.value
                                          );
                                        }
                                      }}
                                    />
                                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                      {isValidatingGithub ? (
                                        <LoaderCircle className="animate-spin size-4" />
                                      ) : githubIssueData?.success ? (
                                        <BadgeCheck className="size-4 text-green-500" />
                                      ) : form.formState.errors.ghBranch ? (
                                        <CircleX className="size-4 text-destructive" />
                                      ) : null}
                                    </div>
                                  </div>
                                </FormControl>
                                <div className="flex items-center gap-2 min-h-[20px]">
                                  {!isValidatingGithub &&
                                    githubIssueData?.success &&
                                    !form.formState.errors.ghBranch && (
                                      <span className="text-xs text-green-500">
                                        Valid branch
                                      </span>
                                    )}
                                  <FormMessage />
                                </div>
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="sm:ms-4">
                          <span className="text-base font-medium">
                            Programming Languages
                          </span>
                          <p className="text-sm text-muted-foreground mb-2">
                            Select 1 to 2 languages to describe the work.{" "}
                          </p>
                          <FormField
                            control={form.control}
                            name="tags"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <TagsSelect
                                    title="Language"
                                    disabled={form.formState.isSubmitting}
                                    tags={field.value}
                                    availableTags={openSourceTags}
                                    maxSelectedAllowed={2}
                                    onChange={field.onChange}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>

                      <div className="mt-4">
                        <FormField
                          control={form.control}
                          name="requirements"
                          render={({ field }) => (
                            <FormItem className="">
                              <FormLabel className="md:text-base">
                                Guidelines
                              </FormLabel>
                              <FormDescription>
                                Provide a detailed explanation of what the
                                submission should include.
                              </FormDescription>
                              <FormControl
                                aria-disabled={form.formState.isSubmitting}
                              >
                                <TiptapEditor
                                  content={field.value}
                                  onChange={field.onChange}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </Card>
                  </motion.div>
                )}
              </>
            )}

            {currentStep === 2 && (
              <motion.div
                initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Card className="flex flex-col gap-6 p-0 sm:p-6 sm:border border-0 sm:shadow-sm shadow-none">
                  <h1 className="font-semibold text-lg sm:text-xl">
                    Additional Options
                  </h1>

                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex sm:flex-row flex-col justify-between gap-2 sm:items-center ">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Private Task
                          </FormLabel>
                          <FormDescription>
                            Task will be hidden and can only be accessed via
                            link.
                          </FormDescription>
                        </div>
                        <FormControl>
                          <Switch
                            disabled={form.formState.isSubmitting}
                            checked={field.value}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  {taskType === TaskType.General && (
                    <FormField
                      control={form.control}
                      name="isBlinksEnabled"
                      disabled={form.formState.isSubmitting}
                      render={({ field }) => (
                        <FormItem className="flex sm:flex-row flex-col justify-between gap-2 sm:items-center">
                          <div className="space-y-0.5">
                            <FormLabel className="md:text-base">
                              Enable Blinks
                            </FormLabel>
                            <FormDescription>
                              Unfurl into blinks when shared on X.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              disabled={form.formState.isSubmitting}
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  )}
                </Card>
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                initial={{ x: delta >= 0 ? "50%" : "-50%", opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                <Card className="flex flex-col gap-6 p-0 sm:p-6 sm:border border-0 sm:shadow-sm shadow-none">
                  <div>
                    <h1 className="font-semibold text-lg sm:text-xl">
                      Deposit & Publish
                    </h1>
                    <p className="text-muted-foreground text-sm">
                      Enter the reward amount you want to deposit for this task.
                    </p>
                  </div>

                  <RadioGroup
                    onValueChange={handlePaymentMethodChange}
                    value={paymentType}
                    disabled={
                      form.formState.isSubmitting || transaction.isProcessing
                    }
                  >
                    <div className="border rounded-md p-3">
                      <div className="flex items-center gap-2 ">
                        <RadioGroupItem value="wallet" id="wallet" />
                        <Label htmlFor="wallet" className="text-xl">
                          Pay with Solana Wallet
                        </Label>
                      </div>
                      {paymentType === "wallet" && (
                        <div className="p-4">
                          <FormField
                            control={form.control}
                            name="amount"
                            render={({ field }) => (
                              <FormItem>
                                <div className="rounded-md bg-muted p-4 flex flex-col gap-3 focus-within:outline outline-1 outline-theme ">
                                  <FormLabel className="md:text-base flex items-center justify-between ">
                                    Amount
                                    <div className="flex items-center gap-1 justify-end text-muted-foreground ">
                                      <div className="text-muted-foreground text-xs flex items-center gap-1 font-medium">
                                        <Wallet className="size-3 inline-block" />
                                        {!form.formState.isSubmitting &&
                                        !walletTokensData &&
                                        (walletTokensLoading ||
                                          isWalletTokensRefetching) ? (
                                          <Icons.spinner className="w-4 h-4 animate-spin" />
                                        ) : (
                                          <span className="text-xs md:text-sm">
                                            {selectedToken?.amount}
                                          </span>
                                        )}
                                      </div>

                                      <Button
                                        size={"sm"}
                                        variant={"ghost"}
                                        disabled={form.formState.isSubmitting}
                                        className="text-xs bg-background border-background border hover:border-theme hover:bg-background hover:text-foreground "
                                        type="button"
                                        onClick={() => {
                                          form.setValue(
                                            "amount",
                                            selectedToken?.amount
                                          );
                                          form.clearErrors();
                                        }}
                                      >
                                        MAX
                                      </Button>
                                    </div>
                                  </FormLabel>
                                  <FormControl className="w-full">
                                    <div className="flex items-center justify-between ">
                                      <Button
                                        variant={"ghost"}
                                        className="shrink-0 bg-background border-background border hover:border-theme hover:bg-background hover:text-foreground"
                                        type="button"
                                        disabled={form.formState.isSubmitting}
                                        onClick={() => {
                                          if (!publicKey) {
                                            return walletModal.setVisible(true);
                                          }
                                          setIsTokenModalOpen(true);
                                        }}
                                      >
                                        <Avatar className="size-5 mr-1 ">
                                          <AvatarImage
                                            src={selectedToken?.imgURL}
                                            alt="token"
                                          />
                                          <AvatarFallback className="bg-muted">
                                            ?
                                          </AvatarFallback>
                                        </Avatar>
                                        {selectedToken?.symbol}
                                        <ChevronDown className="size-4" />
                                      </Button>
                                      <div className="relative">
                                        <Input
                                          placeholder="0.00"
                                          type="number"
                                          disabled={form.formState.isSubmitting}
                                          className={cn(
                                            "grow min-w-0 w-full focus:outline-none sm:text-lg h-10 placeholder:text-muted-foreground text-right bg-transparent border-none font-semibold pr-0",
                                            error && "text-destructive"
                                          )}
                                          {...field}
                                          onChange={(e) => {
                                            if (Number(e.target.value) < 0)
                                              return;
                                            field.onChange(e);
                                            form.trigger("amount");
                                          }}
                                        />
                                        <span className="absolute text-muted-foreground -bottom-2 right-0 text-xs">
                                          $
                                          {(
                                            (selectedTokenPrice ?? 0) *
                                            (depositAmount ?? 0)
                                          ).toFixed(2)}
                                        </span>
                                      </div>
                                    </div>
                                  </FormControl>
                                </div>
                                <FormMessage className="text-xs md:text-sm" />
                              </FormItem>
                            )}
                          />

                          <div className=" text-sm">
                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <p className="text-muted-foreground">Deposit</p>
                              <p className=" text-right">
                                {depositAmount ? depositAmount : 0}{" "}
                                {selectedToken?.symbol}
                              </p>
                            </div>

                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <p className="text-muted-foreground">
                                Platform Fee (5%){" "}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <CircleHelp className="size-4 inline-block cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>5% of deposit in USDC value</p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </p>
                              <p className=" text-right ">
                                {isPlatformFeeLoading ? (
                                  <Skeleton className="w-16 h-4 inline-flex" />
                                ) : (
                                  `${platformFee} SOL`
                                )}{" "}
                              </p>
                            </div>

                            <div className="flex justify-between items-center flex-wrap gap-2">
                              <p className="text-muted-foreground text-sm">
                                Max Transaction Fee{" "}
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger>
                                      <CircleHelp className="size-4 inline-block cursor-pointer" />
                                    </TooltipTrigger>
                                    <TooltipContent>
                                      <p>
                                        This is for Solana transaction fee and
                                        Priority fee
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </p>
                              <p className="text-right">
                                {(isPriorityFeeModeMaxCap
                                  ? maxPriorityFee
                                  : exactPriorityFee
                                ).toFixed(4)}{" "}
                                SOL
                              </p>
                            </div>

                            <Separator className="my-2" />

                            <div className="flex justify-between items-center flex-wrap gap-2 font-bold text-xl sm:text-2xl">
                              <p className="text-foreground ">Total</p>
                              <p className=" text-foreground text-right">
                                <span className="flex items-center gap-2 justify-end">
                                  {depositAmount ? depositAmount : 0}{" "}
                                  {selectedToken?.symbol}{" "}
                                  <Avatar className="size-5">
                                    <AvatarImage
                                      src={selectedToken?.imgURL}
                                      alt="token"
                                    />
                                    <AvatarFallback className="bg-muted">
                                      ?
                                    </AvatarFallback>
                                  </Avatar>
                                </span>
                                <span className="flex items-center gap-2 justify-end">
                                  + ~
                                  {(
                                    (platformFee ?? 0) +
                                    (isPriorityFeeModeMaxCap
                                      ? maxPriorityFee
                                      : exactPriorityFee)
                                  ).toFixed(4)}{" "}
                                  SOL
                                  <Avatar className="size-5">
                                    <AvatarImage
                                      src={
                                        "https://cdn.gib.work/token-images/solana.png"
                                      }
                                      alt="token"
                                    />
                                    <AvatarFallback className="bg-muted">
                                      ?
                                    </AvatarFallback>
                                  </Avatar>
                                </span>
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>

                    <div className="border rounded-md p-3">
                      <div className="flex items-start gap-2 ">
                        <RadioGroupItem
                          value="teleswap"
                          id="teleswap"
                          className="mt-1.5"
                        />
                        <div>
                          <Label htmlFor="teleswap" className="text-xl">
                            Pay with other Network
                          </Label>
                          <p className="text-base text-muted-foreground">
                            Use a different network to pay for work
                          </p>
                        </div>
                      </div>
                      {paymentType === "teleswap" && (
                        <TeleswapDepositForm
                          taskType={taskType}
                          formData={form.getValues()}
                          teleswapFormData={teleswapFormData}
                          setTeleswapFormData={setTeleswapFormData}
                        />
                      )}
                    </div>
                  </RadioGroup>
                </Card>
              </motion.div>
            )}

            <Separator className="sm:hidden" />

            <div className="flex flex-wrap gap-2 justify-end">
              {currentStep > 0 && (
                <Button
                  onClick={prev}
                  type="button"
                  disabled={
                    currentStep === 0 ||
                    form.formState.isSubmitting ||
                    transaction.isProcessing
                  }
                  variant={"secondary"}
                >
                  Prev
                </Button>
              )}
              {currentStep < steps.length - 1 ? (
                <Button
                  onClick={next}
                  type="button"
                  disabled={currentStep === steps.length - 1}
                >
                  Next
                </Button>
              ) : paymentType === "teleswap" ? null : !publicKey ? (
                <Button
                  type="button"
                  onClick={() => walletModal.setVisible(true)}
                >
                  Connect Wallet
                </Button>
              ) : (
                <LoaderButton
                  disabled={
                    form.formState.isSubmitting ||
                    !!form.formState.errors.amount ||
                    !isValidDeposit
                  }
                  isLoading={form.formState.isSubmitting}
                >
                  {selectedToken.symbol === "SOL" &&
                  depositAmount >= selectedToken.amount
                    ? `Insufficient ${selectedToken.symbol}`
                    : depositAmount > selectedToken.amount
                    ? `Insufficient ${selectedToken.symbol}`
                    : solBalance <
                      (platformFee ?? 0) +
                        (isPriorityFeeModeMaxCap
                          ? maxPriorityFee
                          : exactPriorityFee)
                    ? "Insufficient SOL"
                    : form.formState.isSubmitting
                    ? "Sending Transaction..."
                    : "Deposit & Publish"}
                </LoaderButton>
              )}
            </div>
          </div>
        </form>
      </Form>
    </>
  );
}
