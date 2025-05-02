"use client";

import React, { useRef, useState } from "react";
import TiptapEditor from "../tiptap/tiptap-editor";
import { v4 as uuidv4 } from "uuid";
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
import PayModal from "../modals/pay-modal";
import { Button } from "../ui/button";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  confirmDepositTransaction,
  depositToken,
} from "@/actions/post/create-question";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { Question } from "@/types/types.work";
import { SignInButton, useAuth } from "@clerk/nextjs";
import { getSupportedTokens } from "@/lib/utils";
import { availableTags } from "@/constants/data";
import useNetwork from "@/hooks/use-network";
import { Deposit } from "@/actions/post/deposit";
import { usePriorityFeeLevelStore } from "@/features/priority-fee/lib/use-priority-fee-level";
interface TokenMetadata {
  symbol: string;
  imgUrl: string;
  mintAddress: string;
  decimals: number;
}
const formSchema = z.object({
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
});

type FormValues = z.infer<typeof formSchema>;

export function QuestionForm() {
  const router = useRouter();
  const { userId } = useAuth();
  const payModal = usePayModal();
  const formRef = useRef<HTMLFormElement | null>(null);
  const { publicKey, signTransaction } = useWallet();
  const transaction = useTransactionStatus();
  const network = useNetwork((state) => state.network);
  const {
    selectedPriority,
    maxPriorityFee,
    exactPriorityFee,
    isPriorityFeeModeMaxCap,
  } = usePriorityFeeLevelStore();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const tokenMetadata: TokenMetadata[] = getSupportedTokens();
  const workTokenMetadata = tokenMetadata.find((w) => w.symbol == "WORK");
  const [paymentDetails, setPaymentDetails] = useState({
    amount: "10000",
    mintAddress: workTokenMetadata?.mintAddress!,
  });

  async function pay(data: z.infer<typeof formSchema>) {
    if (!publicKey || !signTransaction || !paymentDetails) return;

    const depositPayload: Deposit = {
      payer: publicKey.toString(),
      strategy: "blockhash",
      token: {
        mintAddress: paymentDetails.mintAddress,
        amount: Number.parseFloat(paymentDetails.amount),
      },
      network,
      priorityFeeLevel: selectedPriority,
      maxPriorityFee: isPriorityFeeModeMaxCap ? maxPriorityFee : null,
      priorityFee: !isPriorityFeeModeMaxCap ? exactPriorityFee : null,
      workType: "Question",
    };

    const depositCreateResponse = await depositToken(depositPayload);

    if (depositCreateResponse.error) {
      throw new Error(depositCreateResponse.error.message);
    }
    const retreivedTx = Transaction.from(
      Buffer.from(depositCreateResponse.success.serializedTransaction, "base64")
    );

    const serializedTx = await signTransaction(retreivedTx);

    const confirmTxPayload = {
      transactionId: depositCreateResponse.success.transactionId,
      serializedTransaction: serializedTx?.serialize().toString("base64"),
      category: `General`,
      content: data.content,
      tags: data.tags,
      title: data.title,
    };

    const transactionResponse = await confirmDepositTransaction(
      confirmTxPayload
    );

    if (transactionResponse.error) {
      throw new Error(transactionResponse.error.message);
    }
  }

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (!payModal.isOpen) {
      return payModal.onOpen();
    }

    try {
      await pay(data);

      toast.success("Question posted successfully!");
      router.push("/questions");
      payModal.onClose();
    } catch (error) {
      toast.error("Oops!", {
        description: (error as Error).message,
      });
    } finally {
      transaction.onEnd();
    }
  }

  return (
    <Form {...form}>
      <form
        ref={formRef}
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8"
      >
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="What is Blockchain?" {...field} />
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
              <FormLabel>Content</FormLabel>
              <FormDescription>
                Introduce the problem and expand on what you put in the title.
                Minimum 20 characters.
              </FormDescription>
              <FormControl>
                <TiptapEditor content={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex items-center gap-6">
          <div className=" flex ">
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tag</FormLabel>

                  <FormDescription>
                    Select a tag to describe what your question in about.{" "}
                  </FormDescription>
                  <FormControl>
                    <TagsSelect
                      title="Category"
                      disabled={form.formState.isSubmitting}
                      tags={field.value}
                      availableTags={availableTags}
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

        <PayModal
          formref={formRef}
          setTxDetails={setPaymentDetails}
          paymentDetails={paymentDetails}
        />

        {!userId ? (
          <SignInButton forceRedirectUrl="/questions/ask-question">
            <Button size="sm" type="button">
              Sign In to ask a Question
            </Button>
          </SignInButton>
        ) : (
          <Button type="submit">Create Work</Button>
        )}
      </form>
    </Form>
  );
}
