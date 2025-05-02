"use client";

import React, { useEffect, useRef } from "react";
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
import { toast } from "sonner";
import { Button } from "../ui/button";
import { update } from "@intercom/messenger-js-sdk";
import { useQueryClient } from "@tanstack/react-query";
import {
  cn,
  getDisplayDecimalAmountFromAsset,
  TipTapEditorCssClasses,
  validateApprovalAmount,
} from "@/lib/utils";
import { useApproveTaskSubmissionModal } from "@/hooks/use-approve-task-submission-modal";
import { Task } from "@/types/types.work";
import { approveTaskSubmission } from "@/actions/post/approve-task-submission";
import { Input } from "../ui/input";
import { Wallet } from "lucide-react";
import { Separator } from "../ui/separator";
import { useMediaQuery } from "usehooks-ts";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { useTokenPrice } from "@/hooks/use-token-price";
import { useTransactionStatus } from "@/hooks/use-transaction-status";
import { LoaderButton } from "../loader-button";

const formSchema = z.object({
  amount: z.coerce
    .number({ required_error: "Amount is required" })
    .positive("Amount must be positive"),
});

type FormValues = z.infer<typeof formSchema>;

export function ApproveTaskForm() {
  const queryClient = useQueryClient();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const amountInputRef = useRef<HTMLInputElement | null>(null);
  // const loadingModal = useLoadingModal();
  const transaction = useTransactionStatus();
  const { taskId, taskSubmissionId, onClose } = useApproveTaskSubmissionModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
  });

  const inputAmount = form.watch("amount");

  const task = queryClient.getQueryData([`tasks-${taskId}`]) as Task;

  const {
    data: assetPrice,
    isLoading: isAssetPriceLoading,
    error: assetPriceError,
  } = useTokenPrice(`${task?.asset?.mintAddress}`, {
    enabled: !!task && !!taskSubmissionId,
  });

  let taskAmount = task?.asset?.amount;

  const additionPayouts = task?.taskSubmissions?.filter(
    (taskSubmission) => taskSubmission?.assetId != null
  ); //taskSubmission.transaction != null && taskSubmission.transaction.statusCode == 200
  additionPayouts.forEach((payout) => {
    taskAmount -= payout?.asset?.amount;
  });

  const handleMaxClick = () => {
    form.setValue(
      "amount",
      getDisplayDecimalAmountFromAsset(taskAmount, task?.asset?.decimals),
      { shouldValidate: true }
    );
    if (amountInputRef.current) {
      amountInputRef.current.focus();
    }
  };

  async function onSubmit(data: FormValues) {
    const err = validateApprovalAmount({
      amount: data.amount,
      availableBalance: getDisplayDecimalAmountFromAsset(
        taskAmount,
        task?.asset?.decimals
      ),
      tokenType: task?.asset?.symbol,
    });
    if (err) {
      return form.setError("amount", {
        type: "manual",
        message: err,
      });
    }
    transaction.onStart();
    const { success, error } = await approveTaskSubmission(
      taskId!,
      taskSubmissionId!,
      data.amount
    );
    if (error) {
      toast.error(error.message);
    }
    if (success) {
      form.reset({ amount: 0 });
      toast.success("Task Approved");
      await queryClient.invalidateQueries({
        queryKey: [`tasks-${taskId}`],
      });
    }
    transaction.onEnd();
    onClose();
  }

  useEffect(() => {
    // Hide Intercom launcher
    update({ hide_default_launcher: true });

    return () => update({ hide_default_launcher: false });
  }, []);

  if (!taskId || !taskSubmissionId) return null;
  return (
    <div className="text-sm flex flex-col gap-1 md:mt-5 border rounded-xl p-4">
      <div className="text-xl font-medium  p-2">
        <div className="flex justify-between items-center  ">
          <p className="">Amount available:</p>
          <p className="flex items-center gap-2 text-right">
            <span>
              {getDisplayDecimalAmountFromAsset(
                taskAmount,
                task.asset.decimals
              )}
            </span>

            <Avatar className="size-5">
              <AvatarImage src={task.asset?.imageUrl} alt="token" />
              <AvatarFallback className="bg-muted">?</AvatarFallback>
            </Avatar>
          </p>
        </div>
        <div className="flex items-center justify-end text-sm text-gray-700 dark:text-gray-300">
          $
          {(
            (assetPrice?.price ?? 0) *
            getDisplayDecimalAmountFromAsset(taskAmount, task.asset.decimals)
          ).toFixed(2)}
        </div>
      </div>
      <Separator className="my-2" />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="">
          <div className="flex justify-end">
            <div className="flex items-center gap-2">
              <div className="text-muted-foreground text-xs flex items-center gap-1 font-medium">
                <Wallet className="size-3 inline-block" />
                <span>
                  {getDisplayDecimalAmountFromAsset(
                    taskAmount,
                    task.asset.decimals
                  )}
                </span>
              </div>
              <Button
                size={"sm"}
                variant={"ghost"}
                disabled={form.formState.isSubmitting}
                className="text-xs bg-secondary border-background border hover:border-theme hover:bg-background hover:text-foreground "
                type="button"
                onClick={handleMaxClick}
              >
                MAX
              </Button>
            </div>
          </div>
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel> Input Amount</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    placeholder={getDisplayDecimalAmountFromAsset(
                      taskAmount,
                      task.asset.decimals
                    ).toString()}
                    {...field}
                    className="text-lg h-12"
                    ref={(e) => {
                      field.ref(e);
                      amountInputRef.current = e; // Assign the input ref
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <p
            className={cn(
              "h-6 text-sm text-gray-700 dark:text-gray-300 py-1 px-2",
              inputAmount ? "" : "invisible"
            )}
          >
            $ {((inputAmount ?? 0) * (assetPrice?.price ?? 0)).toFixed(2)}
          </p>

          <div
            className={cn("flex flex-col items-center justify-end gap-2 mt-4")}
          >
            <LoaderButton
              type="submit"
              variant="default"
              className="w-full"
              isLoading={form.formState.isSubmitting}
              disabled={!form.formState.isValid || form.formState.isSubmitting}
            >
              Approve
            </LoaderButton>
          </div>
        </form>
      </Form>
    </div>
  );
}
