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
import { useParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "../ui/button";

import { useLoadingModal } from "@/hooks/use-loading-modal";
import { useQueryClient } from "@tanstack/react-query";
import { TipTapEditorCssClasses } from "@/lib/utils";
import { createTaskSubmission } from "@/actions/post/create-task-submission";
import { useReferralStore } from "@/features/referral/lib/use-referral-store";
import { validateHTMLContentLength } from "@/lib/dom-purify";

const formSchema = z.object({
  content: z
    .string()
    .max(10000)
    .min(2)
    .refine((data) => validateHTMLContentLength(data, 2)),
});

type FormValues = z.infer<typeof formSchema>;

export function TaskSubmissionForm() {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { taskId } = useParams();
  const loadingModal = useLoadingModal();
  const referralCode = useReferralStore((state) => state.referralCode);
  const clearReferral = useReferralStore((state) => state.clearReferral);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),

    mode: "onChange",
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    loadingModal.onOpen();
    const content = {
      content: data.content,
      referral: referralCode ?? null,
    };
    const response = await createTaskSubmission(content, taskId as string);

    if (response.success) {
      form.reset({ content: "" });
      await queryClient.invalidateQueries({
        queryKey: [`tasks-${taskId}`],
      });
      clearReferral();
      toast.success("Response posted successfully!");
      router.refresh();
    } else if (response.error) {
      toast.error("Oops!", {
        description: response.error.message,
      });
    }

    loadingModal.onClose();
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className={`flex flex-col gap-4 ${TipTapEditorCssClasses}`}
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

        <Button type="submit" className="ml-auto" variant="tertiary">
          Post Submission
        </Button>
      </form>
    </Form>
  );
}
