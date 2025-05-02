"use client";

import React from "react";
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
import { toast } from "sonner";
import { Button } from "../ui/button";

import { useLoadingModal } from "@/hooks/use-loading-modal";
import { useQueryClient } from "@tanstack/react-query";
import { TipTapEditorCssClasses } from "@/lib/utils";
import { createTaskSubmissionComment } from "@/actions/post/create-task-submission-comment";
import { validateHTMLContentLength } from "@/lib/dom-purify";

const formSchema = z.object({
  content: z
    .string()
    .max(10000)
    .min(2)
    .refine((data) => validateHTMLContentLength(data, 2)),
});

type FormValues = z.infer<typeof formSchema>;
type TaskSubmissionCommentFormProps = {
  taskId: string;
  submissionId: string;
  onFinish: () => void;
  onCancel: () => void;
};

export function TaskSubmissionCommentForm({
  taskId,
  submissionId,
  onFinish,
  onCancel,
}: TaskSubmissionCommentFormProps) {
  const queryClient = useQueryClient();
  const loadingModal = useLoadingModal();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    mode: "onSubmit",
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    loadingModal.onOpen();
    const response = await createTaskSubmissionComment(
      taskId,
      submissionId,
      data
    );

    if (response.success) {
      form.reset({ content: "" });
      await queryClient.invalidateQueries({
        queryKey: [`tasks-${taskId}`],
      });
      toast.success("Comment posted successfully!");
    } else if (response.error) {
      toast.error("Oops!", {
        description: response.error.message,
      });
    }

    loadingModal.onClose();
    onFinish();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex flex-col gap-4  ${TipTapEditorCssClasses}`}
      >
        <FormField
          control={form.control}
          name="content"
          render={({ field }) => (
            <FormItem>
              <FormLabel />
              <FormControl>
                <TiptapEditor content={field.value} onChange={field.onChange} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex gap-2 ml-auto">
          <Button
            type="button"
            variant="outline"
            className="text-black dark:text-white"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" variant="tertiary">
            Post Comment
          </Button>
        </div>
      </form>
    </Form>
  );
}
