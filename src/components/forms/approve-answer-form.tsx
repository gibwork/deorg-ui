"use client";

import React, { useRef, useState } from "react";
import TiptapEditor from "../tiptap/tiptap-editor";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

import { createAnswer } from "@/actions/post/create-answer";
import { useLoadingModal } from "@/hooks/use-loading-modal";
import { useQueryClient } from "@tanstack/react-query";
import {
  getDisplayDecimalAmountFromAsset,
  TipTapEditorCssClasses,
} from "@/lib/utils";
import { createTaskSubmission } from "@/actions/post/create-task-submission";
import { useApproveTaskSubmissionModal } from "@/hooks/use-approve-task-submission-modal";
import { Question, Task } from "@/types/types.work";
import { approveTaskSubmission } from "@/actions/post/approve-task-submission";
import { Input } from "../ui/input";
import { useApproveModal } from "@/hooks/use-approve-modal";
import { approveAnswer } from "@/actions/post/approve-answer";

const formSchema = z.object({
  amount: z.coerce
    .number({ required_error: "Amount is required" })
    .positive("Amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export function ApproveAnswerForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  const loadingModal = useLoadingModal();
  const { isOpen, questionId, answerId, onClose } = useApproveModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    mode: "onChange",
  });
  if (!questionId || !answerId) return null;

  const question = queryClient.getQueryData([
    `questions-${questionId}`,
  ]) as Question;

  let questionAmount = getDisplayDecimalAmountFromAsset(
    question.asset.amount,
    question.asset.decimals
  );
  const additionPayouts = question?.answers!.filter(
    (answer) => answer.assetId != null
  ); //taskSubmission.transaction != null && taskSubmission.transaction.statusCode == 200
  additionPayouts.forEach((payout) => {
    questionAmount -= getDisplayDecimalAmountFromAsset(
      payout.asset.amount,
      payout.asset.decimals
    );
  });

  const handleMaxClick = () => {
    form.setValue("amount", questionAmount);
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  async function onSubmit(data: z.infer<typeof formSchema>) {
    if (data.amount > questionAmount) {
      return form.setError("amount", {
        type: "manual",
        message: "Amount exceeds the available balance",
      });
    }
    loadingModal.onOpen();
    const { success, error } = await approveAnswer(
      questionId!,
      answerId!,
      data.amount
    );
    if (error) {
      toast.error(error.message);
    }
    if (success) {
      form.reset({ amount: 0 });
      toast.success("Answer Approved");
      await queryClient.invalidateQueries({
        queryKey: [`questions-${questionId}`],
      });
    }
    loadingModal.onClose();
    onClose();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="">
        <div>
          <span className="text-sm block font-light">
            {" "}
            amount available: {questionAmount}
          </span>
        </div>
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem className={TipTapEditorCssClasses}>
              <FormLabel />
              <FormControl className=" focus-visible:ring-white border-l-0 border-r-0 border-t-0 font-semibold text-black dark:text-white dark:placeholder:text-zinc-700 placeholder:text-gray-300 rounded-none text-2xl p-2 w-1/3 text-center">
                <Input
                  type="number"
                  placeholder={questionAmount.toString()}
                  {...field}
                  ref={(e) => {
                    field.ref(e);
                    amountInputRef.current = e; // Assign the input ref
                  }}
                />
              </FormControl>
              <button
                type="button"
                onClick={handleMaxClick}
                className="!mt-1 hover:underline ps-1 text-black dark:text-white opacity-85 hover:opacity-100"
              >
                pay max available
              </button>
              <FormMessage className="dark:text-red-500" />
            </FormItem>
          )}
        />

        <div className="flex items-center justify-end gap-2 mt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="default">
            Approve
          </Button>
        </div>
      </form>
    </Form>
  );
}
