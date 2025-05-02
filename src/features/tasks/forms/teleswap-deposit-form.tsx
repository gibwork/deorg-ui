"use client";
import React, { useEffect, useState } from "react";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowRight,
  Check,
  CheckCircleIcon,
  CircleAlert,
  CircleHelp,
  Copy,
} from "lucide-react";
import { TeleswapTokenSelect } from "../components/teleswap-token-select";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Button, buttonVariants } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import LoaderDots from "@/components/loader-dots";
import { useTransactionStatus } from "@/hooks/use-transaction-status";

import { CreateTaskFormDataType } from "../schema/create-task-schema";
import { toast } from "sonner";
import { usePlatformFee } from "../lib/use-platform-fee";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { useRouter } from "next/navigation";
import { TeleswapWarningModal } from "../components/teleswap-warning-modal";
import {
  TeleSwapFormData,
  TeleswapTransactionStatus,
} from "@/types/teleswap.types";
import { getMultichainQuote } from "@/actions/get/get-multichain-quote";
import { Icons } from "@/components/icons";
import Link from "next/link";
import { useReferralStore } from "@/features/referral/lib/use-referral-store";
import { TaskType } from "@/constants/data";
import {
  createMultichainBountyDeposit,
  createMultichainTaskDeposit,
  getMultichainBountyStatus,
  getMultichainTaskStatus,
} from "../actions/multichain";
const steps = ["Select Coin", "Deposit Address"];

interface TeleswapDepositFormProps {
  taskType: TaskType;
  formData?: CreateTaskFormDataType;
  teleswapFormData: TeleSwapFormData;
  setTeleswapFormData: React.Dispatch<React.SetStateAction<TeleSwapFormData>>;
}

const TeleswapDepositForm: React.FC<TeleswapDepositFormProps> = ({
  taskType,
  formData,
  teleswapFormData,
  setTeleswapFormData,
}) => {
  const router = useRouter();
  const [selectedCoin, setSelectedCoin] = useState({
    name: "USDC",
    symbol: "usdcbase",
    network: "Base",
  });
  const [isTeleswapWarningModalOpen, setIsTeleswapWarningModalOpen] =
    useState(false);

  const [activeStep, setActiveStep] = useState(0);
  const [errors, setErrors] = useState({
    coin: "",
    amount: "",
  });
  const transaction = useTransactionStatus();
  const referralCode = useReferralStore((state) => state.referralCode);
  const clearReferral = useReferralStore((state) => state.clearReferral);

  const {
    tokenPrice: selectedTokenPrice,
    platformFee,
    error: platformFeeError,
    isLoading: isPlatformFeeLoading,
    calculatePlatformFee,
  } = usePlatformFee({
    selectedTokenAddress: "So11111111111111111111111111111111111111112",
    depositAmount: Number(teleswapFormData?.depositQuote),
  });

  const {
    data: taskStatusData,
    isLoading: isTasksStatusLoading,
    isFetching: isTasksStatusFetching,
  } = useQuery({
    queryKey: ["multiChainTaskStatus", teleswapFormData?.taskId],
    queryFn: async () => {
      const { success, error } =
        taskType === TaskType.Github
          ? await getMultichainBountyStatus(teleswapFormData?.taskId!)
          : await getMultichainTaskStatus(teleswapFormData?.taskId!);
      if (error) throw new Error(error.message);
      if (success) return success;
    },
    initialData: {
      status: "NONE",
    },
    enabled:
      !!teleswapFormData?.taskId &&
      !["CLOSED", "FAILED"].includes(teleswapFormData?.status),
    refetchInterval: 1000,
  });

  const handleGenerateQuote = async () => {
    if (!formData) return;
    if (!teleswapFormData?.depositAmount) {
      return setErrors((prev) => ({
        ...prev,
        amount: "Please enter the amount!",
      }));
    }
    try {
      transaction.onStart();
      const { success, error } = await getMultichainQuote(
        selectedCoin.symbol,
        teleswapFormData?.depositAmount
      );
      if (error) throw new Error(error.message);

      setTeleswapFormData((prev) => ({
        ...prev,
        status: "QUOTE_FETCHED",
        depositQuote: success.quote,
      }));
    } catch (error) {
      setErrors((prev) => ({
        ...prev,
        amount: (error as Error).message,
      }));
      toast.error((error as Error).message);
    } finally {
      transaction.onEnd();
    }
  };

  const processTeleswapDeposit = async () => {
    if (!formData || !teleswapFormData?.depositAmount) return;

    try {
      const basePayload = {
        title: formData.title,
        requirements: formData.requirements,
        tags: formData.tags,
        isHidden: formData.isPrivate,
        allowOnlyVerifiedSubmissions: formData.allowOnlyVerifiedSubmissions,
        deadline: formData.deadline,
        chain: selectedCoin.symbol,
        amount: teleswapFormData?.depositAmount,
        referral: referralCode ?? null,
      };

      transaction.onStart();
      setActiveStep((prev) => prev + 1);

      if (taskType === TaskType.General) {
        const { success, error } = await createMultichainTaskDeposit({
          ...basePayload,
          content: formData.content,
          isBlinksEnabled: formData.isBlinksEnabled,
        });
        if (error) throw new Error(error.message);
        setTeleswapFormData((prev) => ({
          ...prev,
          taskId: success?.taskId,
          depositQuote: success?.quote,
        }));
      } else {
        const { success, error } = await createMultichainBountyDeposit({
          ...basePayload,
          overview: formData.content,
          externalUrl: formData.externalUrl!,
          ghBranch: formData.ghBranch!,
        });
        if (error) throw new Error(error.message);
        setTeleswapFormData((prev) => ({
          ...prev,
          taskId: success?.bountyId,
          depositQuote: success?.quote,
        }));
      }
    } catch (error) {
      setActiveStep((prev) => prev - 1);
      setErrors((prev) => ({
        ...prev,
        amount: (error as Error).message,
      }));
      toast.error((error as Error).message);
      transaction.onEnd();
    }
  };

  const handleNext = async () => {
    if (!teleswapFormData?.depositAmount) {
      return setErrors((prev) => ({
        ...prev,
        amount: `Please Enter an amount to proceed!`,
      }));
    }
    if (activeStep < steps.length - 1) {
      await processTeleswapDeposit();
    }
  };

  const handleBack = () => {
    setIsTeleswapWarningModalOpen(true);
  };

  const renderStatus = () => {
    if (taskStatusData) {
      switch (taskStatusData.status) {
        case "CREATING":
          return <p>Creating Escrow...</p>;

        case "ESCROW_CREATED":
          return <p>Generating Deposit Address..</p>;

        case "WAITING_RECEIVE_FUNDS":
          return <p>Depost Address</p>;

        case "CREATED":
          return <p>Depost Address</p>;

        case "CLOSED":
          return <p>Depost Address</p>;

        default:
          return <p>Fetching Quote...</p>;
      }
    }

    return <p>Fetching Quote...</p>;
  };
  const handleBackWarningModal = () => {
    if (activeStep > 0) {
      setActiveStep((prev) => prev - 1);
    }
  };

  const setStatus = (newStatus: TeleswapTransactionStatus) => {
    setTeleswapFormData((prev) => ({
      ...prev,
      status: newStatus,
    }));
  };

  useEffect(() => {
    if (taskStatusData) {
      if (taskStatusData.status === "FAILED") {
        setStatus("FAILED");
        transaction.onEnd();
        setActiveStep((prev) => prev - 1);
        setTeleswapFormData((prev) => ({
          ...prev,
          taskId: null,
          depositQuote: null,
          depositAddress: null,
          status: "NONE",
        }));
        toast.error("Failed to generate Deposit Address.");
      } else if (taskStatusData?.teleswapData?.status === "confirming") {
        setStatus("DEPOSIT_DETECTED");
        clearReferral();
      } else if (taskStatusData.status === "WAITING_RECEIVE_FUNDS") {
        setStatus("WAITING_RECEIVE_FUNDS");
        transaction.onEnd();
      } else if (taskStatusData.status === "CREATED") {
        setStatus("CREATED");
        toast.success("Task posted successfully!");
        router.push(`/tasks/${teleswapFormData?.taskId}?share=true`);
      } else if (taskStatusData.status === "CLOSED") {
        setTeleswapFormData((prev) => ({
          ...prev,
          taskId: null,
          depositQuote: null,
          depositAddress: null,
          status: "NONE",
        }));
        transaction.onEnd();
      }
      if (taskStatusData?.teleswapData) {
        setTeleswapFormData((prev) => ({
          ...prev,
          depositAddress: taskStatusData?.teleswapData?.addressFrom,
        }));
      }
    }
  }, [taskStatusData]);

  return (
    <>
      <TeleswapWarningModal
        isOpen={isTeleswapWarningModalOpen}
        onClose={setIsTeleswapWarningModalOpen}
        onConfirm={handleBackWarningModal}
        status={teleswapFormData.status}
      />
      <div className="p-2 sm:p-4">
        <div className="w-full max-w-3xl mx-auto space-y-2 pb-4">
          {/* Stepper Header */}
          <div className="hidden relative">
            <div className="flex justify-between items-center translate-x-20">
              {steps.map((step, index) => (
                <div
                  key={step}
                  className="flex flex-col items-center relative w-full"
                >
                  <div className="flex items-center w-full">
                    <div
                      className={`flex items-center justify-center size-6  text-sm rounded-full  transition-all duration-500 
                    ${
                      index < activeStep
                        ? "bg-theme "
                        : index === activeStep
                        ? "bg-theme text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                    >
                      {index < activeStep ? (
                        <Check className="size-4 text-white " />
                      ) : (
                        <span className=" ">{index + 1}</span>
                      )}
                    </div>
                    {index < steps.length - 1 && (
                      <div className="w-full  h-0.5 bg-gray-200 relative">
                        <div
                          className="absolute top-0 left-0 h-full w-full bg-theme transition-all duration-500"
                          style={{
                            width: index < activeStep ? "100%" : "0%",
                          }}
                        />
                      </div>
                    )}
                  </div>
                  <span
                    className={`mt-2 w-full text-sm font-medium ${
                      index <= activeStep ? "text-black" : "text-gray-400"
                    }`}
                  >
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className=" w-full bg-muted rounded-md p-2 sm:p-4">
            <div
              className={`transition-all w-full duration-500 ${
                activeStep === 0 ? "block" : "hidden"
              }`}
            >
              <div className="space-y-2  ">
                <div className="text-sm text-muted-foreground font-medium ">
                  Select Coin
                </div>
                <div className="flex items-center justify-between">
                  <TeleswapTokenSelect
                    selectedCoin={selectedCoin.symbol}
                    setSelectedCoin={setSelectedCoin}
                  />

                  <Input
                    placeholder="0.00"
                    type="number"
                    disabled={transaction.isProcessing}
                    className={cn(
                      "grow min-w-0 w-full focus:outline-none sm:text-lg h-10 placeholder:text-muted-foreground text-right bg-transparent border-none font-semibold pr-0"
                    )}
                    onChange={(e) => {
                      if (Number(e.target.value) < 0) return;
                      setErrors({
                        coin: "",
                        amount: "",
                      });

                      setTeleswapFormData((prev) => ({
                        ...prev,
                        status: "NONE",
                        depositQuote: null,
                        depositAmount: Number(e.target.value),
                      }));
                    }}
                  />
                </div>

                {errors.amount && (
                  <p className="text mt-1 text-sm text-red-500">
                    {errors.amount}
                  </p>
                )}
              </div>
            </div>

            <div
              className={`transition-all duration-500 ${
                activeStep === 1 ? "block" : "hidden"
              }`}
            >
              <div className="space-y-2  p-1">
                <div className="text-base text-muted-foreground font-medium ">
                  {renderStatus()}
                </div>
                {transaction.isProcessing ? (
                  <div className="flex flex-col items-center">
                    <LoaderDots />
                  </div>
                ) : (
                  taskStatusData?.teleswapData?.addressFrom && (
                    <div className="flex items-end sm:items-center  break-all  ">
                      <p className="break-words text-lg">
                        {taskStatusData?.teleswapData?.addressFrom ?? ""}
                      </p>
                      <button
                        className="ml-3 "
                        onClick={() => {
                          navigator.clipboard
                            .writeText(teleswapFormData?.depositAddress!)
                            .then(
                              function () {
                                /* clipboard successfully set */
                                toast.success("Copied to clipboard");
                              },
                              function () {
                                /* clipboard write failed */
                                toast.error("Failed to copy to clipboard");
                              }
                            );
                        }}
                      >
                        <span className="sr-only">Copy</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="fill-muted-foreground dark:hover:fill-white hover:fill-black size-5"
                          viewBox="0 0 512 512"
                        >
                          <path d="M408 480H184a72 72 0 01-72-72V184a72 72 0 0172-72h224a72 72 0 0172 72v224a72 72 0 01-72 72z" />
                          <path d="M160 80h235.88A72.12 72.12 0 00328 32H104a72 72 0 00-72 72v224a72.12 72.12 0 0048 67.88V160a80 80 0 0180-80z" />
                        </svg>
                      </button>
                    </div>
                  )
                )}
              </div>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className=" flex items-center justify-between text-muted-foreground -translate-y-2">
            <button
              type="button"
              onClick={handleBack}
              disabled={activeStep === 0}
              className={cn(activeStep === 0 ? "invisible" : "", "px-1")}
            >
              Back
            </button>
            {activeStep === 0 && !teleswapFormData.depositQuote && (
              <button
                type="button"
                onClick={handleGenerateQuote}
                disabled={transaction.isProcessing}
                className="text-sm font-medium flex items-center gap-2 px-1"
              >
                Generate Quote
                {transaction.isProcessing ? (
                  <Icons.spinner className="animate-spin w-4 h-4 mt-0.5" />
                ) : (
                  <ArrowRight className="w-4 h-4 mt-1" />
                )}
              </button>
            )}

            {activeStep === 0 &&
              teleswapFormData.status === "QUOTE_FETCHED" && (
                <button
                  type="button"
                  onClick={handleNext}
                  disabled={transaction.isProcessing}
                  className="text-sm font-medium flex items-center gap-2 px-1"
                >
                  Continue Swap
                  <ArrowRight className="w-4 h-4 mt-1" />
                </button>
              )}
          </div>
        </div>

        <div className=" text-sm">
          <div className="flex justify-between items-center flex-wrap gap-2">
            <p className="text-muted-foreground">Deposit</p>
            <p className=" text-right">
              {teleswapFormData?.depositQuote
                ? teleswapFormData?.depositQuote
                : 0}{" "}
              SOL
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

          <Separator className="my-2" />

          <div className="flex justify-between items-center flex-wrap gap-2 font-bold text-xl sm:text-2xl">
            <p className="text-foreground ">Total</p>
            <p className=" text-foreground text-right">
              <span className="flex items-center gap-2 justify-end">
                {teleswapFormData?.depositQuote
                  ? teleswapFormData?.depositQuote
                  : 0}{" "}
                SOL
                <Avatar className="size-5">
                  <AvatarImage
                    src={"https://cdn.gib.work/token-images/solana.png"}
                    alt="token"
                  />
                  <AvatarFallback className="bg-muted">?</AvatarFallback>
                </Avatar>
              </span>
              <span className="flex items-center gap-2 justify-end">
                + ~{(platformFee ?? 0).toFixed(4)} SOL
                <Avatar className="size-5">
                  <AvatarImage
                    src={"https://cdn.gib.work/token-images/solana.png"}
                    alt="token"
                  />
                  <AvatarFallback className="bg-muted">?</AvatarFallback>
                </Avatar>
              </span>
            </p>
          </div>
        </div>
        <Separator className="my-2" />

        {teleswapFormData.status === "CREATED" && (
          <div className="space-y-4">
            <div className="rounded-lg p-4 flex items-center justify-center space-x-2 bg-green-50 border dark:bg-green-950/50  border-green-200 dark:border-green-900  text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-5 w-5" />
              <span className="">Task Created Successfully!</span>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>redirecting you to task page...</p>
            </div>

            <div className="text-center">
              <Link
                href={`/tasks/${teleswapFormData.taskId}`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                View Task
              </Link>
            </div>
          </div>
        )}

        {teleswapFormData.status === "DEPOSIT_DETECTED" && (
          <div className="space-y-4">
            <div className=" flex items-center justify-center space-x-2  rounded-lg p-4 bg-green-50 border dark:bg-green-950/50  border-green-200 dark:border-green-900  text-green-600 dark:text-green-400">
              <CheckCircleIcon className="h-5 w-5" />
              <span>Deposit Detected!</span>
            </div>

            <div className="text-center text-sm text-gray-600 dark:text-gray-400">
              <p>
                Great! We&apos;ve detected your deposit and are now processing
                your task creation.
              </p>
              <p>
                You can safely navigate away from this page - we&apos;ll handle
                the rest.
              </p>
            </div>

            <div className="text-center">
              <Link
                href={`/dashboard`}
                className={cn(buttonVariants({ variant: "outline" }))}
              >
                Go to Dashboard
              </Link>
            </div>

            <div className="text-sm text-gray-500 dark:text-gray-500 text-center">
              Your can check the status of your task in the dashboard.
              <br />
              This usually takes 5-7 minutes.
            </div>
          </div>
        )}

        {teleswapFormData.status === "WAITING_RECEIVE_FUNDS" && (
          <>
            <div className="space-y-4 py-2">
              <div className="flex items-center justify-center space-x-2 text-amber-600 dark:text-amber-400">
                <Icons.spinner className="animate-spin h-5 w-5" />
                <span>Waiting for your deposit...</span>
              </div>
            </div>

            <div className="bg-muted rounded-lg p-4 space-y-3">
              <h3 className="font-medium flex items-center gap-2">
                <Icons.info className="w-4 h-4 inline-flex" />
                Payment Instructions
              </h3>

              <ul className="list-disc pl-4 md:pl-8 space-y-2 text-gray-700 dark:text-gray-300">
                <li>
                  Send exactly{" "}
                  <span className="font-medium uppercase text-black dark:text-white">
                    {teleswapFormData.depositAmount} {selectedCoin.name}
                  </span>{" "}
                  to the address above
                </li>
                <li>
                  Use the{" "}
                  <span className="font-medium uppercase text-black dark:text-white">
                    {selectedCoin.network}
                  </span>{" "}
                  network only
                </li>
                <li>Once sent, you can safely leave this page</li>
                <li>
                  Your task will be created automatically when we detect your
                  deposit
                </li>
              </ul>

              <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900 rounded-lg p-3 mt-4">
                <p className="text-sm font-medium text-amber-800 dark:text-amber-300 flex items-center gap-2">
                  <CircleAlert className="w-4 h-4" />
                  Important
                </p>
                <p className="text-sm text-amber-700 dark:text-amber-300 mt-1">
                  Using incorrect amount or network may result in lost funds.
                  Double-check all details before sending.
                </p>
              </div>
            </div>

            <div className="text-sm text-gray-600 dark:text-gray-400 text-center py-2">
              <p>You can leave this page after sending the funds.</p>
              <p>
                We&apos;ll create your task automatically once we detect your
                deposit.
              </p>
            </div>
          </>
        )}
      </div>
    </>
  );
};

export default TeleswapDepositForm;
