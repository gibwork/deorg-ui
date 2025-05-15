"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { LoaderButton } from "@/components/loader-button";
import { createTaskTransaction } from "../../actions/tasks/create-task-transaction";
import { useWallet } from "@solana/wallet-adapter-react";
import { createTask } from "../../actions/tasks/create-task";
import { Transaction } from "@solana/web3.js";
import { useParams } from "next/navigation";
const formSchema = z.object({
  title: z
    .string()
    .min(3, "Title must be at least 3 characters")
    .max(80, "Title must not exceed 80 characters"),
  description: z
    .string()
    .min(10, "Description must be at least 10 characters")
    .max(1000, "Description must not exceed 1000 characters"),
  amount: z.coerce.number().max(1000, "Amount must not exceed 1000 SOL"),
  assigneeAccountAddress: z.string().min(1, "Please select an assignee"),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateTaskFormProps {
  members: Array<{
    id: string;
    username: string;
    walletAddress: string;
    profilePicture: string;
  }>;
  projectId: string;
  onSuccess?: () => void;
}

export function CreateTaskForm({
  members,
  projectId,
  onSuccess,
}: CreateTaskFormProps) {
  const { signTransaction } = useWallet();
  const queryClient = useQueryClient();
  const { orgId } = useParams();
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      amount: 0,
      assigneeAccountAddress: "",
    },
  });

  const onSubmit = async (data: FormValues) => {
    if (!signTransaction) return;

    try {
      const { success } = await createTaskTransaction({
        title: data.title,
        description: data.description,
        paymentAmount: data.amount,
        memberAccountAddress: data.assigneeAccountAddress,
        projectAccountAddress: projectId,
      });

      if (!success) {
        throw new Error("Failed to create task");
      }

      const retreivedTx = Transaction.from(
        Buffer.from(success.serializedTransaction, "base64")
      );

      const serializedTransaction = await signTransaction(retreivedTx);

      const task = await createTask({
        organizationId: orgId as string,
        transactionId: success.transactionId,
        serializedTransaction: serializedTransaction
          ?.serialize()
          .toString("base64"),
      });

      if (!task.success) {
        throw new Error("Failed to create task");
      }

      console.log(task);

      toast.success("Task created successfully!");
      await queryClient.invalidateQueries({
        queryKey: [`project-${projectId}-tasks`],
      });
      onSuccess?.();
    } catch (error) {
      toast.error("Failed to create task");
      console.error(error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title" {...field} />
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
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Describe the task in detail"
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Payment Amount</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.1"
                  placeholder="Enter amount in SOL"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assigneeAccountAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Assignee</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a member" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {members.map((member) => (
                    <SelectItem key={member.id} value={member.walletAddress}>
                      {member.username}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end">
          <LoaderButton isLoading={form.formState.isSubmitting}>
            Create Task
          </LoaderButton>
        </div>
      </form>
    </Form>
  );
}
