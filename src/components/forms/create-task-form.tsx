"use client";

import React, { useEffect, useRef, useState } from "react";
import TiptapEditor from "../tiptap/tiptap-editor";
import { v4 as uuidv4, validate } from "uuid";
import { Transaction } from "@solana/web3.js";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
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
import { TagsSelect } from "../tags-select";
import { toast } from "sonner";
import { usePayModal } from "@/hooks/use-pay-modal";
import { format } from "date-fns";
import { Button } from "../ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  confirmTaskDepositTransaction,
  Deposit,
  depositToken,
} from "@/actions/post/create-task";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { SignInButton, useAuth } from "@clerk/nextjs";
import useNetwork from "@/hooks/use-network";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { CalendarIcon, CircleDot, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "../ui/calendar";
import { Switch } from "../ui/switch";
import { getSupportedTokens } from "@/lib/utils";
import { Icons } from "../icons";
import SelectTokenModal, {
  SelectTokenComponent,
} from "../modals/select-token-modal";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useWalletSelectModal } from "@/hooks/use-wallet-modal";
import { useQuery } from "@tanstack/react-query";
import { getUserSPLTokenBalances } from "@/actions/get/get-wallet-token-balances";
import { formatTokenAmount } from "@/utils/format-amount";
import { TimePicker12Demo } from "../time-picker/time-picker-12hour-demo";
import dayjs from "dayjs";
import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
import { useReferralStore } from "@/features/referral/lib/use-referral-store";
interface TokenMetadata {
  symbol: string;
  imgUrl: string;
  mintAddress: string;
  decimals: number;
}

const formSchema = z
  .object({
    title: z
      .string()
      .min(3, {
        message: "title must be at least 3 characters.",
      })
      .max(100, {
        message: "title must not be longer than 30 characters.",
      }),
    tags: z
      .string({
        required_error: "Category is required.",
      })
      .array(),
    content: z.string().max(10000).min(4),
    requirements: z.string().max(1000).min(4),
    isPrivate: z.boolean().default(false),
    isFeatured: z.boolean().default(false),
    amount: z.coerce.number({
      message: "Amount is required.",
    }),
    deadline: z.date(),
  })
  .refine((data) => !(data.isPrivate && data.isFeatured), {
    message: "Task cannot be both private and featured",
    path: ["isPrivate", "isFeatured"], // You can customize error paths if needed
  });

type FormValues = z.infer<typeof formSchema>;
const tasksCategories = [
  "Misc",
  "Feedback",
  "Social Media",
  "Programming",
  "Writing",
];
export function CreateTaskForm() {
  const router = useRouter();
  const { userId } = useAuth();
  const payModal = usePayModal();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { publicKey, signTransaction } = useWallet();
  const transaction = useTransactionStatus();
  const network = useNetwork((state) => state.network);
  const referralCode = useReferralStore((state) => state.referralCode);
  const clearReferral = useReferralStore((state) => state.clearReferral);
  const {
    selectedPriority,
    maxPriorityFee,
    exactPriorityFee,
    isPriorityFeeModeMaxCap,
  } = usePriorityFeeLevelStore();
  const selectWalletModal = useWalletSelectModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      deadline: dayjs().add(1, "day").toDate(),
    },
  });

  const tokenMetadata: TokenMetadata[] = getSupportedTokens();
  const usdcTokenMetadata = tokenMetadata.find((w) => w.symbol == "SOL");
  const [paymentDetails, setPaymentDetails] = useState({
    amount: 0,
    symbol: "SOL",
    imgURL: usdcTokenMetadata?.imgUrl!,
    mintAddress: usdcTokenMetadata?.mintAddress!,
  });
  const [isTokenModalOpen, setIsTokenModalOpen] = useState(false);

  const {
    data: walletTokensData,
    error: walletTokensError,
    isLoading: walletTokensLoading,
    refetch,
    isRefetching: isWalletTokensRefetching,
  } = useQuery({
    queryKey: ["userTokenList"],
    queryFn: async () => {
      const userTokens = await getUserSPLTokenBalances(
        publicKey!.toBase58(),
        network
      );
      if (userTokens.error) throw new Error(userTokens.error);

      const token = userTokens.success.find(
        (token: any) => token.address == paymentDetails?.mintAddress
      );
      setPaymentDetails({
        ...paymentDetails,
        amount: formatTokenAmount(
          token.tokenInfo.balance,
          token.tokenInfo.decimals
        ),
      });
      return userTokens.success;
    },
    // refetchInterval: 10 * 1000,
    enabled: !!publicKey,
  });

  useEffect(() => {
    if (network && publicKey) {
      refetch();
    }
  }, [network, publicKey, refetch]);

  // const validateAmount = (amount: number) => {
  //   if (paymentDetails.amount === 0) return;
  //   if (isNaN(amount)) {
  //     form.setError("amount", { message: "Please enter a valid number" });
  //   } else if (amount <= 0) {
  //     form.setError("amount", { message: "Amount must be greater than zero" });
  //   } else if (
  //     paymentDetails.amount !== null &&
  //     amount > paymentDetails.amount
  //   ) {
  //     form.setError("amount", {
  //       message: `Amount must not exceed available balance of ${paymentDetails.amount}`,
  //     });
  //   } else {
  //     form.clearErrors("amount");
  //   }
  // };

  async function pay(data: z.infer<typeof formSchema>) {
    if (!publicKey || !signTransaction || !paymentDetails) return;

    const depositPayload: Deposit = {
      payer: publicKey.toString(),
      strategy: "blockhash",
      token: {
        mintAddress: paymentDetails.mintAddress!,
        amount: Number(data.amount!),
      },
      network,
      priorityFeeLevel: selectedPriority,
      maxPriorityFee: isPriorityFeeModeMaxCap ? maxPriorityFee : null,
      priorityFee: !isPriorityFeeModeMaxCap ? exactPriorityFee : null,
      workType: "Task",
      referral: referralCode ?? null,
    };

    const depositCreateResponse = await depositToken(depositPayload);

    if (depositCreateResponse.error) {
      if (depositCreateResponse.error.statusCode === 400) {
        form.setError("amount", { message: "Minimum amount not met" });
      }
      throw new Error(depositCreateResponse.error.message);
    }
    const retreivedTx = Transaction.from(
      Buffer.from(depositCreateResponse.success.serializedTransaction, "base64")
    );

    const serializedTx = await signTransaction(retreivedTx);

    const confirmTxPayload = {
      transactionId: depositCreateResponse.success.transactionId,
      serializedTransaction: serializedTx?.serialize().toString("base64"),
      content: data.content,
      requirements: data.requirements,
      tags: data.tags,
      title: data.title,
      isHidden: data.isPrivate,
      isFeatured: data.isFeatured,
      deadline: data.deadline,
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

  async function onSubmit(data: z.infer<typeof formSchema>) {
    // if (data.amount > paymentDetails.amount) {
    //   form.setError("amount", { message: "Insufficient funds" });
    //   return toast.warning(
    //     "Amount must not exceed available balance of " + paymentDetails.amount
    //   );
    // }
    try {
      const taskResponse = await pay(data);
      clearReferral();
      toast.success("Task posted successfully!");
      router.push(`/tasks/${taskResponse?.success.id}?share=true`);
      payModal.onClose();
    } catch (error) {
      toast.error("Oops!", {
        description: (error as Error).message,
      });
    } finally {
      transaction.onEnd();
    }
  }

  React.useEffect(() => {
    if (!publicKey) {
      setPaymentDetails({
        ...paymentDetails,
        amount: 0,
      });
    } else {
      refetch();
    }
    //eslint-disable-next-line
  }, [publicKey]);

  return (
    <>
      <SelectTokenModal
        isOpen={isTokenModalOpen}
        setIsOpen={setIsTokenModalOpen}
        title="Select Token"
        description="Select the token you want to pay with"
        setPaymentDetails={setPaymentDetails}
      />
      <Form {...form}>
        <form
          ref={formRef}
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-8"
        >
          <div className="flex flex-col xl:flex-row gap-5">
            <div className=" space-y-8 max-w-2xl 2xl:max-w-3xl">
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
                    <FormLabel className="md:text-base">Content</FormLabel>
                    <FormDescription>
                      Describe the task in detail; the purpose here is for users
                      to understand what the job/task entails. Save the
                      requirements for the next section.
                    </FormDescription>
                    <FormControl aria-disabled={form.formState.isSubmitting}>
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
                name="requirements"
                render={({ field }) => (
                  <FormItem className="">
                    <FormLabel className="md:text-base">Requirements</FormLabel>
                    <FormDescription>
                      Please outline the requirements that a submission must
                      meet to be considered for payment.
                    </FormDescription>
                    <FormControl aria-disabled={form.formState.isSubmitting}>
                      <TiptapEditor
                        content={field.value}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="text-sm md:text-base font-medium leading-none">
                  Additional Options
                </h3>

                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="isPrivate"
                    render={({ field }) => (
                      <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-xl">
                        <div className="space-y-0.5">
                          <FormLabel className="text-base">
                            Private Task
                          </FormLabel>
                          <FormDescription>
                            Private Tasks are only available via shared links.
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

                  {/*
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 max-w-xl">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Feature Task</FormLabel>
                    <FormDescription>
                      Featured tasks will be highlighted and prioritized for
                      better visibility.
                      <br />
                      $10
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            /> */}
                </div>
              </div>

              <FormField
                control={form.control}
                name="deadline"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel className="text-left">Deadline</FormLabel>

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
                          toDate={dayjs("2024-12-31").toDate()}
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

              <div className="flex items-center gap-6">
                <div className=" flex ">
                  <FormField
                    control={form.control}
                    name="tags"
                    disabled={form.formState.isSubmitting}
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="md:text-base">Category</FormLabel>

                        <FormDescription>
                          Select a Category to describe what your task is about.{" "}
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
                </div>
              </div>
            </div>

            <div>
              <FormField
                control={form.control}
                name="amount"
                disabled={form.formState.isSubmitting}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="md:text-base flex justify-between max-w-xs ">
                      Deposit
                      <div className="flex items-start gap-1 justify-end translate-y-1 md:translate-y-2 text-muted-foreground ">
                        {walletTokensLoading || isWalletTokensRefetching ? (
                          <Icons.spinner className="w-4 h-4 animate-spin" />
                        ) : (
                          <span className="text-xs md:text-sm">
                            {paymentDetails.amount}
                          </span>
                        )}
                        <Button
                          variant="secondary"
                          type="button"
                          className="h-5 px-2 text-xs md:text-sm"
                          onClick={() => {
                            form.setValue("amount", paymentDetails.amount);
                            form.clearErrors();
                          }}
                        >
                          max
                        </Button>
                      </div>
                    </FormLabel>
                    <FormControl className="w-full rounded-md border border-input">
                      <div className="flex items-center justify-between max-w-xs">
                        <Input
                          className="border-none"
                          placeholder="Enter Amount"
                          {...field}
                        />
                        <Button
                          variant="ghost"
                          type="button"
                          disabled={form.formState.isSubmitting}
                          onClick={() => setIsTokenModalOpen(true)}
                          className="h-7 !px-2 space-x-1 text-xs mr-2"
                        >
                          <Avatar className="w-4 h-4 mr-1 ">
                            <AvatarImage
                              src={paymentDetails.imgURL}
                              alt="token"
                            />
                            <AvatarFallback className="bg-muted">
                              ?
                            </AvatarFallback>
                          </Avatar>
                          {paymentDetails.symbol}
                          <ChevronDown className="size-4" />
                        </Button>
                      </div>
                    </FormControl>
                    {/* <FormMessage className="text-xs" /> */}
                  </FormItem>
                )}
              />
              {!userId ? (
                <SignInButton forceRedirectUrl="/questions/ask-question">
                  <Button size="sm" type="button" className="w-full max-w-xs">
                    Sign In to create a task
                  </Button>
                </SignInButton>
              ) : !publicKey ? (
                <Button
                  type="button"
                  className="w-full max-w-xs mt-5"
                  variant="theme"
                  onClick={() => selectWalletModal.onOpen()}
                >
                  Connect Wallet
                </Button>
              ) : form.formState.isSubmitting ? (
                <Button
                  disabled
                  type="button"
                  variant="theme"
                  className="w-full max-w-xs flex items-center font-medium text-xs mt-5 "
                >
                  <Icons.spinner className=" w-4 h-4 mr-2   animate-spin" />
                  Sending Transaction...
                </Button>
              ) : (
                <>
                  <Button
                    type="submit"
                    disabled={!!form.formState.errors?.amount}
                    className="w-full max-w-xs mt-5"
                    variant="theme"
                  >
                    {!!form.formState.errors?.amount
                      ? form.formState.errors.amount.message
                      : "Create Work"}
                  </Button>

                  {selectedPriority === "Medium" && (
                    <div className="text-sm bg-muted rounded-lg p-3 mt-5 max-w-xs">
                      <p className="text-gray-500 dark:text-gray-500/90">
                        <span className="flex items-center gap-2 text-gray-800 dark:text-gray-200 text-sm md:text-base ">
                          Priority Fees
                        </span>
                        Fast priority may experience delays during peak times.{" "}
                        <br />
                        Ultra priority is recommended.
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* <PayModal
          formref={formRef}
          setTxDetails={setPaymentDetails}
          paymentDetails={paymentDetails}
        /> */}
        </form>
      </Form>
    </>
  );
}
